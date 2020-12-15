import { createStore } from 'vuex'
import _ from 'lodash'
import dayjs from 'dayjs'
import { v4 } from 'uuid'
import Jimp from 'jimp'
import firebase from '@/firebase'
import invites from '@/modules/invites'
import collectionModule from '@/modules/collectionModule'
import { firebaseGet } from '@/utils'

const store = createStore({
  modules: {
    content: collectionModule('content'),
    invites,
    users: collectionModule('users'),
  },
  state: {
    uiBusy: false,
    noAccessPath: '',
    stage0: {
      auth: false,
      loaded: false
    },
    filters: [],
    bookmarksOpen: false,
    loading: false,
    images: {},
    user: null,
    tags: {},
    sortedTags: [],
    peopleList: [],
    peopleIndex: {},
    booksIndex: {},
    booksList: [],
    booksFiltered: [],
    bundlesIndex: {},
    bundlesList: [],
    submissionsIndex: {},
    viewMode: 'covers'
  },
  mutations: {
    setBusy(ctx, busy) {
      ctx.uiBusy = busy
    },
    setBookmarksOpen(ctx, state) {
      ctx.bookmarksOpen = state
    },
    setImage(ctx, img) {
      ctx.images[img.url] = img.data
    },
    resetFilters(ctx) {
      ctx.filters = []
      ctx.booksFiltered = ctx.booksList
    },
    toggleFilter(ctx, filter) {
      if (!ctx.filters.includes(filter)) {
        // eslint-disable-next-line fp/no-mutating-methods
        ctx.filters.push(filter)
      }
      else {
        ctx.filters = ctx.filters.filter(x => x !== filter)
      }
      ctx.booksFiltered = ctx.booksList.filter(book => {
        if (!ctx.filters.length) return true
        return ctx.filters.every(tag => (book.tags || []).includes(tag))
      })
    },
    setNAP(ctx, p) {
      ctx.noAccessPath = p
    },
    setUser(ctx, u) {
      ctx.user = u
      ctx.stage0.auth = true
    },
    setUserProfile(ctx, p) {
      if (ctx.user) {
        ctx.user.profile = p
      }
    },
    setUserRoles(ctx, list) {
      if (ctx.user) {
        ctx.user.roles = list
      }
    },
    setStage0Load(ctx) {
      ctx.stage0.loaded = true
    },
    setTags(ctx, list) {
      ctx.tags = list
    },
    setSortedTags(ctx, list) {
      ctx.sortedTags = list
    },
    setBooks(ctx, books) {
      ctx.booksIndex = books || {}
      const list = Object.keys(books || {}).map(id => books[id])
      ctx.booksList = _.shuffle(list)
      ctx.booksFiltered = ctx.booksList
    },
    setPeople(ctx, people) {
      ctx.peopleIndex = people || {}
      ctx.peopleList = Object.keys(people || {}).map(id => people[id])
    },
    setBundles(ctx, bundles) {
      ctx.bundlesIndex = bundles || {}
      ctx.bundlesList = Object.values(bundles || [])
    },
    setViewMode(ctx, mode) {
      ctx.viewMode = mode
    },
    indexSubmission(ctx, sub) {
      ctx.submissionsIndex[sub.id] = sub
    },
  },
  actions: {

    // tags
    async addTag(ctx, tag) {
      if (!tag || !tag.tag || !tag.tag.length) {
        return
      }
      ctx.commit('setBusy', true)
      // eslint-disable-next-line  fp/no-mutating-methods
      const id = v4()
      const ref = await firebase.database().ref(`tags/${id}`)
      // console.log('set ref', ref, id)
      const now = dayjs()
      await ref.set({
        id,
        tag: tag.tag,
        sortOrder: parseInt(tag.sortOrder) || 0,
        showOnFront: !!tag.showOnFront,
        created: now.format(),
        updated: now.format()
      })
      return await ctx.dispatch('loadTags')
    },
    async updateTag(ctx, data) {
      if (!data || !data.tag || !data.tag.length) {
        return
      }
      ctx.commit('setBusy', true)
      const ref = await firebase.database().ref(`tags/${data.id}`)
      const now = dayjs()
      // ref.once('value',s
      const val = await ref.once('value')
      const snap = val.val()
      // console.log('update?', data, snap)
      snap.tag = data.tag
      snap.showOnFront = !!data.showOnFront
      snap.sortOrder = parseInt(data.sortOrder)
      snap.updated = now.format()
      if (!snap.created) {
        snap.created = now.format()
      }
      // console.log('set ref', ref, id)
      // console.log('updating ', snap)
      await ref.set(snap)
      return await ctx.dispatch('loadTags')
    },
    async delTag(ctx, tagid) {
      ctx.commit('setBusy', true)
      const ref = await firebase.database().ref(`tags/${tagid}`)
      await ref.remove()
      return await ctx.dispatch('loadTags')
    },

    async loadTags(ctx) {
      ctx.commit('setBusy', true)
      const tags = await firebaseGet('tags')
      if (!tags || tags.length === 0) {
        console.error('No tags in database')
        return
      }
      store.commit('setTags', tags)
      const tagObjects = Object.keys(tags || []).map(k => {
        return { ...tags[k] }
      })

      // eslint-disable-next-line fp/no-mutating-methods
      const sorted = tagObjects.sort((a, b) => {
        if (a.sortOrder === b.sortOrder) {
          return 0
        }
        return a.sortOrder > b.sortOrder ? 1 : -1
      })
      store.commit('setSortedTags', sorted)
      ctx.commit('setBusy', false)
    },

    // books
    async saveBook(ctx, info) {
      ctx.commit('setBusy', true)
      console.log('saving book store', info)
      /**/
      const id = info.book.id && info.book.id.length ? info.book.id : v4()
      // checking and saving authors if not exists
      /*
      // eslint-disable-next-line fp/no-loops
      for (const person of info.book.authors) {
        const exists = ctx.state.peopleList.reduce((acc, x) => {
          // console.log('checking', x.name, person)
          return x.name.toLowerCase() === person.toLowerCase() ? true : acc
        }, false)
        if (!exists) {
          console.log('saving person', person)
          await ctx.dispatch('savePerson', {
            name: person
          })
        }
      }
      */
      let photoUrl = ''
      let photoWidth = info.book.coverWidth || 0
      let photoHeight = info.book.coverHeight || 0
      // uploading photo
      if (typeof info.book.cover === 'string' && info.book.cover.startsWith('http')) {
        photoUrl = info.book.cover
      }
      else {
        console.log('converting and uploading photo')
        const img = await Jimp.read(info.book.cover)
        // console.log(img, 'img')
        photoWidth = img.bitmap.width
        photoHeight = img.bitmap.height
        const buff = await img.getBufferAsync(Jimp.MIME_PNG)
        const photoRef = await firebase.storage().ref(`books/${id}`)
        await photoRef.put(buff, { contentType: 'image/png', cacheControl: 'public,max-age=3600' })
        photoUrl = await photoRef.getDownloadURL()
      }

      // const img2 = await Jimp.read(photoUrl)
      // console.log('!!!', img2)

      // saving book
      console.log('building tags')
      const tags = Object.keys(info.book.tags)
        .filter(x => !!info.book.tags[x])
        .map(x => ctx.state.sortedTags.reduce((acc, t) => t.id === x ? t.tag : acc, null))
        .filter(x => !!x)
      const bookRef = await firebase.database().ref(`books/${id}`)
      const now = dayjs()
      const bookData = {
        id: id,
        isbn: info.book.isbn,
        title: info.book.title,
        goodread: info.book.goodread,
        description: info.book.description,
        cover: photoUrl,
        coverWidth: photoWidth,
        coverHeight: photoHeight,
        publisher: info.book.publisher,
        year: parseInt(info.book.year),
        authors: info.book.authors,
        illustrators: info.book.illustrators,
        tags: tags,
        createdAt: info.book.createdAt || now.format(),
        createdBy: info.book.createdBy || info.book.approvedBy || null,
        approvedAt: info.book.approvedAt || info.book.approvedBy ? now.format() : null,
        approvedBy: info.book.approvedBy || null,
        updatedAt: now.format()
      }
      console.log('saving', bookData)
      await bookRef.set(bookData)
      await ctx.dispatch('loadBooks')
    },

    async loadImage(ctx, url) {
      if (ctx.state.images[url]) {
        return
      }
      const jimp = await Jimp.read(url)
      const data = await jimp.getBase64Async(Jimp.MIME_PNG)
      ctx.commit('setImage', { url, data })
    },

    async loadBooks(ctx) {
      ctx.commit('setBusy', true)
      const books = await firebaseGet('books')
      ctx.commit('setBooks', books || {})
      ctx.commit('setBusy', false)
    },

    async delBook(ctx, id) {
      ctx.commit('setBusy', true)
      const ref = await firebase.database().ref(`books/${id}`)
      const refp = await firebase.storage().ref(`books/${id}`)
      await ref.remove()
      try {
        await refp.delete()
      }
      catch (e) {}
      return await ctx.dispatch('loadBooks')
    },

    // people
    async savePerson(ctx, info) {
      ctx.commit('setBusy', true)
      // eslint-disable-next-line  fp/no-mutating-methods
      const id = info.id && info.id.length ? info.id : v4()
      let photoUrl = info.photo || ''
      if (info.file) {
        const photoRef = await firebase.storage().ref(`people/${id}`)
        await photoRef.put(info.file, { contentType: 'image/png', cacheControl: 'public,max-age=3600' })
        photoUrl = await photoRef.getDownloadURL()
      }

      const ref = await firebase.database().ref(`people/${id}`)
      const now = dayjs()
      const created = info.createdAt || now.format()
      await ref.set({
        name: info.name,
        email: info.email || '',
        bio: info.bio || '',
        role: info.role || '',
        id: id,
        books: [],
        photo: photoUrl,
        createdAt: created,
        createdBy: info.createdBy || ctx.state.user.uid,
        approvedAt: info.approvedAt || info.approvedBy ? now.format() : null,
        approvedBy: info.approvedBy || null,
        updatedAt: now.format()
      })
      await ctx.dispatch('loadPeople')
      return id
    },
    async delPerson(ctx, id) {
      ctx.commit('setBusy', true)
      const ref = await firebase.database().ref(`people/${id}`)
      const refp = await firebase.storage().ref(`people/${id}`)
      await ref.remove()
      try {
        await refp.delete()
      }
      catch (e) {}
      return await ctx.dispatch('loadPeople')
    },

    async loadPeople(ctx) {
      ctx.commit('setBusy', true)
      const people = await firebaseGet('people')
      store.commit('setPeople', people)
      ctx.commit('setBusy', false)
    },

    async loadBundles(ctx) {
      ctx.commit('setBusy', true)
      const bundles = await firebaseGet('bundles')
      if (!bundles || bundles.length === 0) {
        console.error('No bundles in database')
        return
      }
      store.commit('setBundles', bundles)
      ctx.commit('setBusy', false)
    },
    async saveBundle(ctx, info) {
      console.log('save bundle', info)
    },
    async delBundle(ctx, id) {
      console.log('del bundle', id)
    },

    // profile
    async toggleBookmark(ctx, mark) {
      ctx.commit('setBusy', true)
      const profile = ctx.state.user.profile
      if (profile.bookmarks[mark.id]) {
        profile.bookmarks = Object.keys(profile.bookmarks)
          .filter(id => id !== mark.id)
          .reduce((acc, id) => ({ [id]: profile.bookmarks[id], ...acc }), {})
      }
      else {
        profile.bookmarks[mark.id] = mark.type
      }
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('setBusy', false)
    },

    async clearBookmarks(ctx, mark) {
      ctx.commit('setBusy', true)
      const profile = ctx.state.user.profile
      profile.bookmarks = {}
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('setBusy', false)
    },

    async saveBookSubmissionsDraft(ctx, draft) {
      ctx.commit('setBusy', true)
      const profile = ctx.state.user.profile
      profile.draftBooks = draft
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('setBusy', false)
    },

    async submitBookSubmission(ctx, list) {
      ctx.commit('setBusy', true)
      const ids = []
      const submissionGroupId = v4()
      const profile = ctx.state.user.profile
      profile.draftBooks = []
      if (!profile.submissions) {
        profile.submissions = {}
      }
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        // eslint-disable-next-line  fp/no-mutating-methods
        const sid = v4()
        const ref = await firebase.database().ref(`submits/books/${sid}`)
        // console.log('set ref', ref, id)
        const now = dayjs()
        const subData = {
          id: sid,
          group: submissionGroupId,
          type: 'book',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          approveComment: '',
          createdBy: ctx.state.user.uid,
          createdAt: now.format(),
          title: sub.title,
          author: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          description: sub.description || '',
          year: sub.year || '',
          publisher: sub.publisher || '',
          cover: sub.cover ? { ...sub.cover } : { url: '', base64: '', width: 1, height: 1 },
          illustrator: Array.isArray(sub.illustrators) ? sub.illustrators.join('. ') : sub.illustrators || '',
          isbn: sub.isbn || '',
          tags: sub.tags,
          otherTag: sub.otherTag || ''
        }
        console.log('saving sub', sub, subData)
        await ref.set(subData)
        profile.submissions[sid] = 'review'
        ctx.commit('indexSubmission', subData)
        // eslint-disable-next-line  fp/no-mutating-methods
        ids.push(sid)
      }
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('setBusy', false)
    },

    async saveBundleSubmissionsDraft(ctx, draft) {
      ctx.commit('setBusy', true)
      const profile = ctx.state.user.profile
      profile.draftBundle = draft
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('setBusy', false)
    },

    async submitBundleSuggestion(ctx, data) {
      ctx.commit('setBusy', true)
      const sid = v4()
      const now = dayjs()
      const sub = {
        id: sid,
        type: 'bundle',
        approved: false,
        approvedBy: null,
        approvedAt: null,
        approveComment: '',
        createdBy: ctx.state.user.uid,
        createdAt: now.format(),
        ...data
      }
      const ref = await firebase.database().ref(`submits/bundles/${sid}`)
      await ref.set(sub)
      const profile = ctx.state.user.profile
      profile.draftBundle = null
      profile.submissions = [...profile.submissions, sid]
      await ctx.dispatch('saveProfile', profile)
      ctx.commit('indexSubmission', sub)
      ctx.commit('setBusy', false)
    },

    async saveProfile(ctx, profile) {
      const ref = firebase.database().ref(`users/${ctx.state.user.uid}/profile`)
      await ref.set(profile)
      ctx.commit('setUserProfile', profile)
    },

    // submissions
    async indexSubmission(ctx, sid) {
      const submissions = await firebaseGet(`submits/books/${sid}`) || await firebaseGet(`submits/bundles/${sid}`)
      if (submissions) {
        ctx.commit('indexSubmission', submissions)
      }
    },

    // deleteSubmission(ctx, id) {
    async deleteSubmission(ctx, sub) {
      if (!sub) {
        return
      }
      console.log('deleting submission', sub)
      const ref = await firebase.database().ref(`submits/${sub.type}s/${sub.id}`)
      const pref = await firebase.database().ref(`users/${sub.createdBy}/profile/submissions/${sub.id}`)
      await pref.remove()
      await ref.remove()
    },

    async rejectSubmission(ctx, sub) {
      console.log('deleting submission', sub)
      const ref = await firebase.database().ref(`submits/${sub.type}s/${sub.id}`)
      const now = dayjs()
      sub.approvedBy = ctx.state.user.uid
      sub.approvedAt = now.format()
      await ref.set(sub)
      const pref = await firebase.database().ref(`users/${sub.createdBy}/profile/submissions/${sub.id}`)
      await pref.set('reject')
    },

    // approve books submission
    async approveSubmissionBooksGroup(ctx, group) {
      console.log('approving', group)
      // eslint-disable-next-line  fp/no-loops
      for (const sub of group.books) {
        const authors = sub.author.split(',').map(x => x.trim())
        const illustrators = sub.illustrator.split(',').map(x => x.trim())
        // eslint-disable-next-line  fp/no-loops
        for (const author of authors) {
          const exists = ctx.state.peopleList.reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!exists) {
            await ctx.dispatch('savePerson', {
              name: author,
              approvedBy: ctx.state.user.uid,
              createdBy: sub.createdBy
            })
          }
        }
        // eslint-disable-next-line  fp/no-loops
        for (const author of illustrators) {
          const exists = ctx.state.peopleList.reduce((acc, person) => person.name.toLowerCase() === author.toLowerCase() ? person.id : acc, null)
          if (!exists) {
            await ctx.dispatch('savePerson', {
              name: author,
              approvedBy: ctx.state.user.uid,
              createdBy: sub.createdBy
            })
          }
        }
        console.log('submission before book', sub, authors, illustrators)
        const now = dayjs()
        await ctx.dispatch('saveBook', {
          book: {
            title: sub.title,
            authors: authors.filter(x => x.length),
            illustrators: illustrators.filter(x => x.length),
            cover: sub.cover.base64 || null,
            description: sub.description,
            isbn: sub.isbn,
            goodread: sub.goodread || '',
            year: sub.year,
            publisher: sub.publisher,
            tags: sub.tags,
            approvedBy: ctx.state.user.uid,
            approvedAt: now.format(),
            createdAt: now.format(),
            createdBy: sub.createdBy
          }
        })
        const subref = await firebase.database().ref(`submits/books/${sub.id}`)
        sub.approvedBy = ctx.state.user.uid
        sub.approvedAt = now.format()
        await subref.set(sub)

        const pref = await firebase.database().ref(`users/${sub.createdBy}/profile/submissions/${sub.id}`)
        await pref.set('approve')
        /**/
      }
    },

    // this method doesn't use store to keep values
    // it used only by administrators
    loadContributorsSubmissions(ctx) {
      return firebaseGet('submits')
    },
    // -- same
    loadContributorProfile(ctx, uid) {
      return firebaseGet(`users/${uid}/profile`)
    },

    // auth
    passwordReset(ctx, email) {
      return firebase.auth().sendPasswordResetEmail(email)
    },

    // start
    async loadStage0(ctx) {
      // const ref = await firebase.database().ref(`people`)
      // await ref.remove()
      await ctx.dispatch('loadTags')
      await ctx.dispatch('loadPeople')
      await ctx.dispatch('loadBooks')
      await ctx.dispatch('content/load')
      await ctx.dispatch('invites/subscribe')
      await ctx.dispatch('users/subscribe')
      // await ctx.dispatch('loadCovers')
      ctx.commit('setStage0Load')
    },

    userLogin(ctx, data) {
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    },

    async userRegister(ctx, { email, name, organization, otherEngagementCategory, password }) {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)
      await store.commit('setUser', { uid: user.uid })
      await store.dispatch('saveProfile', { email, name, organization, otherEngagementCategory })
    },
  }
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    const u = {}
    u.displayName = user.displayName
    u.email = user.email
    u.emailVerified = user.emailVerified
    u.photoURL = user.photoURL
    u.isAnonymous = user.isAnonymous
    u.uid = user.uid
    u.providerData = user.providerData
    u.profile = {
      email: u.email,
      name: '',
      bundles: [],
      bookmarks: {},
      submissions: {},
      draftBooks: [],
      draftBundles: []
    }
    u.roles = {}
    const userRef = firebase.database().ref(`users/${u.uid}`)
    userRef.on('value', snap => {
      console.log('profile', snap.val()?.profile)
      u.profile = { ...snap.val()?.profile }
      u.roles = snap.val()?.roles || {}
      if (!u.roles.authorized) {
        u.roles.authorized = true
      }
      store.commit('setUser', u)
      store.dispatch('saveProfile', u.profile)
    })
  }
  else {
    store.commit('setUser', null)
  }
})

window.store = store

export default store
