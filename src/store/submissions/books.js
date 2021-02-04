import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'
import * as slugify from '@sindresorhus/slugify'
import managed from '@/store/modules/managed'
import almostEqual from '@/util/almostEqual'
import isSame from '@/util/isSame'
import mergeOne from '@/util/mergeOne'
import sendEmail from '@/util/sendEmail'

/** Renders a book as a small snippet of HTML for the approval email template. */
const renderBook = sub => {

  const bookDetailUrl = `${window.location.origin}/book/${slugify(sub.title.replace(/'/g, ''))}-${sub.isbn}`
  const illustratorsHtml = sub.illustrators ?
    `<br><b>illustrated by</b> ${sub.illustrators}</a>`
    : ''
  const imageHtml = sub.thumbnail ?
    `<p><a href="${bookDetailUrl}" target="_blank"><img src="${sub.thumbnail}" /></a></p>`
    : ''

  return `
    <p>
      <b><a href="${bookDetailUrl}" target="_blank">${sub.title}</a></b><br>
      <b>words by</b> ${sub.authors}
        ${illustratorsHtml}
    </p>
    ${imageHtml}
  `
}

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

      // send email
      const submitter = await context.dispatch('users/loadOne', sub.createdBy, { root: true })
      if (!submitter) {
        const message = `Could not find user ${sub.createdBy} for submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${sub.createdBy} of submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }

      const firstName = submitter.profile.name && submitter.profile.name.includes(' ')
        ? submitter.profile.name.slice(0, submitter.profile.name.indexOf(' '))
        : submitter.profile.name

      const salutation = firstName
        ? `Dear ${firstName},`
        : 'Hello,'

      await sendEmail({
        to: submitter.profile.email,
        subject: 'A Thousand Worlds - Thank you for your Book Submission',
        body: `
          <p>${salutation}</p>
          <p>Thank you for filling out a Book Submission Form and being part of <b>A Thousand Worlds!</b></p>
          <p>Your submission was not accepted for the public directory at this time, but we have retained it in our records and appreciate your contribution.</p>
          <p>Should you have any feedback, questions or concerns don't hesitate to reach out: <a href ="mailto:${process.env.VUE_APP_ADMIN_EMAIL}">${process.env.VUE_APP_ADMIN_EMAIL}</a></p>
          <p>Warm regards,<br>
            -Cátia Chien & ATW team
            </p>
        `
      })
    },

    /** Approves submissions group. Send email */
    approve: async (context, subs) => {

      await Promise.all(subs.map(sub => context.dispatch('approveBook', sub)))

      const createdBy = subs[0].createdBy

      // send email
      const submitter = await context.dispatch('users/loadOne', createdBy, { root: true })
      if (!submitter) {
        const message = `Could not find user ${createdBy}`
        console.error(message, subs)
        throw new Error(message)
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${createdBy}`
        console.error(message, subs)
        throw new Error(message)
      }

      const firstName = submitter.profile.name && submitter.profile.name.includes(' ')
        ? submitter.profile.name.slice(0, submitter.profile.name.indexOf(' '))
        : submitter.profile.name

      const salutation = firstName
        ? `Dear ${firstName},`
        : 'Hello,'

      await sendEmail({
        to: submitter.profile.email,
        subject: 'A Thousand Worlds - Thank you for your Book Submission!',
        body: `
          <p>${salutation}</p>
          <p>
            Thank you for filling out a Book Submission Form and being part of <b>A Thousand Worlds!</b><br>
            We have reviewed your book submission and we are thrilled to add your recommendations to our free online directory.
          ${subs.map(sub => renderBook(sub)).join('\n')}
          <p>Should you have any feedback, questions or concerns don't hesitate to reach out: <a href ="mailto:${process.env.VUE_APP_ADMIN_EMAIL}">${process.env.VUE_APP_ADMIN_EMAIL}</a></p>
          <p>We are so thrilled to have you be part of our community. And we thank you for your dedication to readers everywhere and for helping shape a more equitable future within the publishing industry!</p>
          <p>Warm regards,<br>
            -Cátia Chien & ATW team
            </p>
        `
      })

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
      await context.dispatch('books/save', { path: bookId, value: {
        createdBy: sub.createdBy,
        creators: creators,
        goodread: sub.goodread || '',
        id: bookId,
        isbn: sub.isbn,
        cover: sub.cover?.base64 ? sub.cover : null,
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

    }

  }
})

export default module
