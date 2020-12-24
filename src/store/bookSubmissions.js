import { firebaseGet, firebaseSet } from '@/utils'
import mergeOne from '@/util/mergeOne'
import managedCollection from '@/store/collection/managed'
import { v4 } from 'uuid'
import dayjs from 'dayjs'

const module = mergeOne(managedCollection('submits/books'), {
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

    // this method doesn't use store to keep values
    // it used only by administrators
    loadContributorProfile(context, uid) {
      return firebaseGet(`users/${uid}/profile`)
    },

    saveContributorProfile(context, data) {
      return firebaseSet(`users/${data.uid}/profile`, data.profile)
    },

    /** Submit books suggestions to Firebase */
    submit: async (context, list) => {
      /**/
      const ids = []
      const submissionGroupId = v4()
      const profile = context.rootState.user.user.profile
      profile.draftBooks = []
      if (!profile.submissions) {
        profile.submissions = {}
      }
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        // eslint-disable-next-line  fp/no-mutating-methods
        const sid = v4()
        // const ref = await firebase.database().ref(`submits/books/${sid}`)
        const subData = {
          approveComment: '',
          approved: false,
          approvedAt: null,
          approvedBy: null,
          authors: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          group: submissionGroupId,
          id: sid,
          illustrators: Array.isArray(sub.illustrators) ? sub.illustrators.join('. ') : sub.illustrators || '',
          isbn: sub.isbn || '',
          otherTag: sub.otherTag || '',
          publisher: sub.publisher || '',
          summary: sub.summary || '',
          tags: sub.tags || {},
          thumbnail: sub.thumbnail,
          title: sub.title,
          type: 'book',
          year: sub.year || '',
        }
        await context.dispatch('save', { path: sid, value: subData })
        profile.submissions[sid] = 'review'
        context.commit('setOne', { path: sid, value: subData })
        // eslint-disable-next-line  fp/no-mutating-methods
        ids.push(sid)
      }
      await context.dispatch('user/saveProfile', profile, { root: true })
      /**/
    },
    /** Reject submission */
    reject: async (context, sub) => {
      // const ref = await firebase.database().ref(`submits/${sub.type}s/${sub.id}`)
      const now = dayjs()
      sub.approvedBy = context.rootState.user.user.uid
      sub.approvedAt = now.format()
      await context.dispatch('save', { path: sub.id, value: sub })
      context.commit('setOne', { path: sub.id, value: sub })
      // const profile = context.rootState.user.user.profile
      const profile = await context.dispatch('loadContributorProfile', sub.createdBy)
      console.log('rejector', profile)
      profile.submissions[sub.id] = 'reject'

      await context.dispatch('saveContributorProfile', { uid: sub.createdBy, profile })
    },
    /** Approves submissions group */
    approve: async (context, list) => {

      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {

        // create tags if required
        if (sub.otherTag?.length) {
          const tagId = v4()
          await context.dispatch('tags/save', { path: tagId, value: {
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
        const creators = {}
        // eslint-disable-next-line  fp/no-loops
        for (const author of authors) {
          let cid = context.rootGetters['creators/list']
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            cid = v4()
            await context.dispatch('creators/save', { path: cid, value: { id: cid, name: author, approvedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'author'
        }
        // eslint-disable-next-line  fp/no-loops
        for (const author of illustrators) {
          let cid = context.rootGetters['creators/list']
            .reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!cid) {
            cid = v4()
            await context.dispatch('creators/save', { path: cid, value: { id: cid, name: author, approvedBy: context.rootState.user.user.uid } }, { root: true })
          }
          creators[cid] = creators[cid] ? 'both' : 'illustrator'
        }

        // saving book
        const bookId = v4()
        await context.dispatch('books/save', { path: bookId, value: {
          approvedBy: context.rootState.user.user.uid,
          createdBy: sub.createdBy,
          creators: creators,
          goodread: sub.goodread || '',
          id: bookId,
          isbn: sub.isbn,
          publisher: sub.publisher,
          submissionId: sub.id,
          summary: sub.summary,
          tags: sub.tags,
          thumbnail: sub.thumbnail,
          title: sub.title,
          year: sub.year,
        } }, { root: true })

        // updating user profile
        const profile = await context.dispatch('loadContributorProfile', sub.createdBy)
        profile.submissions[sub.id] = 'approve'
        await context.dispatch('saveContributorProfile', { uid: sub.createdBy, profile })

        // updating submission
        sub.approvedBy = context.rootState.user.user.uid
        sub.approved = true
        await context.dispatch('save', { path: sub.id, value: sub })
      }

    },
    /** Delete submission from Firebase */
    delete: async (context, sid) => {
      const sub = context.state.data[sid]
      const profile = await context.dispatch('loadContributorProfile', sub.createdBy)
      profile.submissions = Object.keys(profile.submissions)
        .filter(id => id !== sid)
        .reduce((acc, id) => {
          acc[id] = profile.submissions[id]
          return acc
        }, {})
      await context.dispatch('saveContributorProfile', { uid: sub.createdBy, profile })
      await context.dispatch('remove', sid)
    }
  }
})

export default module
