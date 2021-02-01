import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'
import * as slugify from '@sindresorhus/slugify'
import managed from '@/store/modules/managed'
import almostEqual from '@/util/almostEqual'
import isSame from '@/util/isSame'
import mergeOne from '@/util/mergeOne'
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

      await sendEmail({
        to: submitter.profile.email,
        subject: 'A Thousand Worlds - Thank you for your submission',
        body: `
          <p>Thank you for your submission to <b>A Thousand Worlds</b>. Your submission was not accepted for the public directory at this time, but we have retained it in our records and appreciate your contribution.</p>
          <p>For questions, email <a href="mailto:info@athousandworlds.org">info@athousandworlds.org</a>.
        `
      })
    },

    /** Approves submissions group. */
    approve: async (context, list) => {
      return list.map(sub => context.dispatch('approveBook', sub))
    },

    /** Approves a single book submission. */
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
      const bookDetailUrl = `${window.location.origin}/book/${slugify(sub.title.replace(/'/g, ''))}-${sub.isbn}`
      const imageHtml = sub.thumbnail ?
        `<p><a href="${bookDetailUrl}" target="_blank"><img src="${sub.thumbnail}" /></a></p>`
        : ''
      const illustratorsHtml = sub.illustrators ?
        `<br><b>illustrated by</b> ${sub.illustrators}</a>`
        : ''

      await sendEmail({
        to: submitter.profile.email,
        subject: 'A Thousand Worlds - Your book has been approved!',
        body: `
          <p>Thank you for your submission to <b>A Thousand Worlds</b>. Your book has been approved!</p>
          <p>
            <b><a href="${bookDetailUrl}" target="_blank">${sub.title}</a></b><br>
            <b>words by</b> ${sub.authors}
              ${illustratorsHtml}
          </p>
          ${imageHtml}
        `
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
