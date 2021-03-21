import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'
import managed from '@/store/modules/managed'
import almostEqual from '@/util/almostEqual'
import isSame from '@/util/isSame'
import mergeOne from '@/util/mergeOne'
import renderBook from '@/util/renderEmailBook'
import sendEmail from '@/util/sendEmail'

const module = mergeOne(managed('submits/books'), {
  getters: {
    filtered: state => state.loaded
      ? Object.values(state.data)
        .filter(book => {
          if (!state.filters.length) return true
          return state.filters.every(tag => (book.tags || []).includes(tag))
        })
      : []
  },
  actions: {

    /** Submit books suggestions to Firebase */
    submit: async (context, list) => {
      const submissionGroupId = uid()
      const profile = context.rootState.user.user.profile
      profile.draftBooks = []
      if (!profile.submissions) {
        profile.submissions = {}
      }
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        const sid = uid()
        const subData = {
          authors: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          group: submissionGroupId,
          id: sid,
          illustrators: Array.isArray(sub.illustrators) ? sub.illustrators.join('. ') : sub.illustrators || '',
          isbn: sub.isbn || '',
          publisher: sub.publisher || '',
          reviewComment: '',
          status: 'pending',
          summary: sub.summary || '',
          tags: sub.tags || {},
          thumbnail: sub.thumbnail,
          title: sub.title,
          type: 'book',
          year: sub.year || '',
        }
        // set state before saving to Firebase, otherwise value gets set to undefined
        context.commit('setOne', { path: sid, value: subData })
        context.dispatch('save', { path: sid, value: subData })
        profile.submissions[sid] = 'pending'
      }
      await context.dispatch('user/saveProfile', profile, { root: true })
    },

    /** Reject submission */
    reject: async (context, sub) => {

      const now = dayjs()
      sub.reviewedBy = context.rootState.user.user.uid
      sub.reviewedAt = now.format()
      sub.status = 'rejected'

      // update book submission
      await context.dispatch('save', { path: sub.id, value: sub })
      context.commit('setOne', { path: sub.id, value: sub })

      // update user profile
      await context.dispatch('user/save', {
        path: `profile/submissions/${sub.id}`,
        value: 'rejected',
      }, { root: true })

      // check submission group to be full reviewved so sending result email is required
      await context.dispatch('checkSubmissionGroup', sub.group)
    },

    /** Approves submissions group. */
    approve: async (context, subs) => {
      // this trick will make promises execution in sequence one by one
      await subs.reduce((prev, sub) => prev.then(() => context.dispatch('approveBook', sub)), Promise.resolve())
    },

    /** Approves a single book submission. Does not send email. */
    approveBook: async (context, sub) => {

      // collect creators and create not existing people
      const authors = sub.authors.split(',').map(x => x.trim()).filter(x => x)
      const illustrators = sub.illustrators.split(',').map(x => x.trim()).filter(x => x)
        // convert "same" text to creator name
        .map(illustrator => isSame(illustrator) ? authors[0] : illustrator)
      const creators = {}

      // add author creators
      // use ids of existing authors if their names match
      // otherwise create a new author
      await authors.forEach(async author => {
        let cid = context.rootGetters['people/list']()
          .find(person => almostEqual(person.name, author))?.id
        if (!cid) {
          cid = uid()
          await context.dispatch('people/save', { path: cid, value: { id: cid, name: author, reviewedBy: context.rootState.user.user.uid } }, { root: true })
        }
        creators[cid] = creators[cid] ? 'both' : 'author'
      })

      // add illustrator creators
      // use ids of existing illustrators if their names match
      // otherwise create a new illustrator
      await illustrators.forEach(async illustrator => {
        let cid = context.rootGetters['people/list']()
          .find(person => almostEqual(person.name, illustrator))?.id
        if (!cid) {
          cid = uid()
          await context.dispatch('people/save', { path: cid, value: { id: cid, name: illustrator, reviewedBy: context.rootState.user.user.uid } }, { root: true })
        }
        creators[cid] = creators[cid] ? 'both' : 'illustrator'
      })

      // save book
      const bookId = uid()

      const bookCover = {}
      if (sub.cover?.url) bookCover.downloadUrl = sub.cover.url
      if (sub.cover?.base64) bookCover.base64 = sub.cover.base64
      if (!sub.cover && sub.thumbnail) bookCover.downloadUrl = sub.thumbnail

      await context.dispatch('books/save', { path: bookId, value: {
        createdBy: sub.createdBy,
        creators: creators,
        goodreads: sub.goodreads || '',
        id: bookId,
        isbn: sub.isbn,
        cover: bookCover,
        publisher: sub.publisher,
        reviewedAt: dayjs().format(),
        reviewedBy: context.rootState.user.user.uid,
        status: 'approved',
        submissionId: sub.id,
        summary: sub.summary,
        tags: sub.tags,
        thumbnail: sub.thumbnail,
        title: sub.title,
        year: sub.year,
      } }, { root: true })

      // update user profile
      await context.dispatch('users/save', {
        path: `${sub.createdBy}/profile/submissions/${sub.id}`,
        value: 'approved',
      }, { root: true })

      // update book submission
      await context.dispatch('save', {
        path: sub.id,
        value: {
          ...sub,
          reviewedAt: dayjs().format(),
          reviewedBy: context.rootState.user.user.uid,
          status: 'approved',
        },
      })

      // check submission group to be full reviewved so sending result email is required
      await context.dispatch('checkSubmissionGroup', sub.group)
    },

    /** Delete submission */
    delete: async (context, sid) => {
      // remove submission
      await context.dispatch('remove', sid)

      // remove from user profile
      await context.dispatch('user/save', {
        path: `profile/submissions/${sid}`,
        value: null,
      }, { root: true })

    },

    /** Collect all submissions from submission group */
    submissionsGroup: (context, gid) => {
      return context.state.loaded ?
        Object.keys(context.state.data)
          .map(id => context.state.data[id])
          .filter(sub => sub.group === gid)
        : []
    },

    /** Checks submission group and send emails if all group records are checked */
    checkSubmissionGroup: async (context, gid) => {
      const group = await context.dispatch('submissionsGroup', gid)
      if (!group.length) {
        // wrong submissions group?
        return
      }
      const hasPending = group.find(sub => sub.status === 'pending')
      if (hasPending) {
        // no need to do anything
        return
      }

      // send email
      // we need any submission from group to get submitter information
      const submission = group[0]
      const submitter = await context.dispatch('users/loadOne', submission.createdBy, { root: true })
      if (!submitter) {
        const message = `Could not find user ${submission.createdBy}`
        console.error(message, group)
        throw new Error(message)
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${submission.createdBy}`
        console.error(message, group)
        throw new Error(message)
      }

      const approved = group.filter(sub => sub.status === 'approved')
      // let emailTemplate = null
      const emailTemplate = context.rootGetters['content/get'](`email/submissions/${approved.length ? 'approved' : 'rejected'}/book`)

      if (!emailTemplate || !emailTemplate.subject || !emailTemplate.body) {
        const message = `No email template for books submission ${approved.length ? 'approving' : 'rejection'}`
        console.error(message, group)
        throw new Error(message)
      }

      const fullName = submitter.profile.name || 'friend'
      const firstName = fullName.includes(' ')
        ? fullName.slice(0, fullName.indexOf(' '))
        : fullName
      const lastName = fullName.includes(' ')
        ? fullName.slice(fullName.indexOf(' ') + 1)
        : ''

      const approvedRecords = approved.length ? approved.map(el => renderBook(el)).join('\n') : ''

      const template = s => s.replace(/FIRST_NAME/g, firstName)
        .replace(/LAST_NAME/g, lastName)
        .replace(/FULL_NAME/g, fullName)
        .replace(/APPROVED_RECORDS/g, approvedRecords)

      // sending email
      await sendEmail({
        to: submitter.profile.email,
        subject: template(emailTemplate.subject),
        body: `<html>
          <head>
            <style>
              p { margin: 0; }
            </style>
          </head>
          <body>
            ${template(emailTemplate.body)}
          </body>
        </html>`
      })

    }

  }
})

export default module
