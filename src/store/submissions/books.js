import mergeOne from '@/util/mergeOne'
import isSame from '@/util/isSame'
import managed from '@/store/modules/managed'
import { v4 } from 'uuid'
import dayjs from 'dayjs'

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
      const submissionGroupId = v4()
      const profile = context.rootState.user.user.profile
      profile.draftBooks = []
      if (!profile.submissions) {
        profile.submissions = {}
      }
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        const sid = v4()
        const subData = {
          authors: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          group: submissionGroupId,
          id: sid,
          illustrators: Array.isArray(sub.illustrators) ? sub.illustrators.join('. ') : sub.illustrators || '',
          isbn: sub.isbn || '',
          otherTag: sub.otherTag || '',
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
      await context.dispatch('save', { path: sub.id, value: sub })
      context.commit('setOne', { path: sub.id, value: sub })

      await context.dispatch('user/save', {
        path: `profile/submissions/${sub.id}`,
        value: 'rejected',
      }, { root: true })
    },

    /** Approves submissions group */
    approve: async (context, list) => {

      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        // create tags if required
        if (sub.otherTag?.length) {
          const tagId = v4()
          await context.dispatch('tags/books/save', { path: tagId, value: {
            id: tagId,
            tag: sub.otherTag,
            showOnFront: false,
            sortOrder: 50
          } }, { root: true })
          if (!sub.tags) sub.tags = {}
          sub.tags[tagId] = true
        }

        // collect creators and create not existing people
        const authors = sub.authors.split(',').map(x => x.trim()).filter(x => x?.length)
        const illustrators = sub.illustrators.split(',').map(x => x.trim()).filter(x => x?.length)
          // convert "same" text to creator name
          .map(illustrator => isSame(illustrator) ? authors[0] : illustrator)
        const creators = {}
        // eslint-disable-next-line  fp/no-loops
        for (const author of authors) {
          let cid = context.rootGetters['people/list']()
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            cid = v4()
            await context.dispatch('people/save', { path: cid, value: { id: cid, name: author, reviewedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'author'
        }
        // eslint-disable-next-line  fp/no-loops
        for (const author of illustrators) {
          let cid = context.rootGetters['people/list']()
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            cid = v4()
            await context.dispatch('people/save', { path: cid, value: { id: cid, name: author, reviewedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'illustrator'
        }

        // save book
        const bookId = v4()
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
      }

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
