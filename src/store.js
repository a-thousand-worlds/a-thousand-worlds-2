import { createStore } from 'vuex'
import _ from 'lodash'
import dayjs from 'dayjs'
import { v4 } from 'uuid'
import Jimp from 'jimp'
import firebase from './firebase'
import content from './modules/content'

const store = createStore({
  modules: {
    content,
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
    loadTags(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setBusy', true)
        firebase.database().ref('tags').once('value', snap => {
          console.log('tags', snap.val())
          const v = snap.val()
          if (!v || v.length === 0) {
            console.error('No tags in database')
            resolve()
          }
          store.commit('setTags', v)
          const tags = Object.keys(v || []).map(k => {
            return { ...v[k] }
          })
          // eslint-disable-next-line fp/no-mutating-methods
          const sorted = tags.sort((a, b) => {
            if (a.sortOrder === b.sortOrder) {
              return 0
            }
            return a.sortOrder > b.sortOrder ? 1 : -1
          })
          store.commit('setSortedTags', sorted)
          ctx.commit('setBusy', false)
          resolve()
        })
      })
    },

    // books
    async saveBook(ctx, info) {
      ctx.commit('setBusy', true)
      // console.log('saving book store', info)
      /**/
      const id = info.book.id && info.book.id.length ? info.book.id : v4()
      // checking and saving authors if not exists
      let i = 0
      // eslint-disable-next-line fp/no-loops
      for (const person of info.book.authors) {
        const exists = ctx.state.people.reduce((acc, x) => {
          // console.log('checking', x.name, person)
          return x.name.toLowerCase() === person.toLowerCase() ? true : acc
        }, false)
        if (!exists) {
          console.log('saving person', person, info.roles[i])
          await ctx.dispatch('savePerson', {
            name: person,
            role: info.roles[i] || 'author'
          })
        }
        i++
      }
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
        await photoRef.put(buff, { contentType: 'image/png' })
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
      console.log('saving')
      const created = info.book.created || now.format()
      await bookRef.set({
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
        tags: tags,
        created: created,
        updated: now.format()
      })
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

    loadBooks(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setBusy', true)
        firebase.database().ref('books').once('value', snap => {
          console.log('books', snap.val())
          ctx.commit('setBooks', snap.val() || {})
          ctx.commit('setBusy', false)
          resolve()
        })
      })
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
        await photoRef.put(info.file)
        photoUrl = await photoRef.getDownloadURL()
      }

      const ref = await firebase.database().ref(`people/${id}`)
      const now = dayjs()
      const created = info.created || now.format()
      await ref.set({
        name: info.name,
        email: info.email || '',
        bio: info.bio || '',
        role: info.role,
        id: id,
        books: [],
        photo: photoUrl,
        created: created,
        updated: now.format()
      })
      await ctx.dispatch('loadPeople')
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
    loadPeople(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setBusy', true)
        firebase.database().ref('people').once('value', snap => {
          const v = snap.val()
          console.log('people', v)
          store.commit('setPeople', v)
          ctx.commit('setBusy', false)
          resolve()
        })
      })
    },

    // bundles
    loadBundles(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setBusy', true)
        firebase.database().ref('bundles').once('value', snap => {
          const v = snap.val()
          if (!v || v.length === 0) {
            console.error('No bundles in database')
            resolve()
          }
          console.log('bundles', v)
          store.commit('setBundles', v)
          ctx.commit('setBusy', false)
          resolve()
        })
      })
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
      // eslint-disable-next-line  fp/no-loops
      for (const sub of list) {
        // eslint-disable-next-line  fp/no-mutating-methods
        const sid = v4()
        const ref = await firebase.database().ref(`submits/books/${sid}`)
        // console.log('set ref', ref, id)
        const now = dayjs()
        const subData = {
          id: sid,
          type: 'book',
          approved: false,
          approvedBy: null,
          approvedAt: null,
          approveComment: '',
          createdBy: ctx.state.user.uid,
          createdAt: now.format(),
          title: sub.title,
          author: sub.author,
          submitterIsAuthor: sub.isAuthor,
          illustrator: sub.illustrator || '',
          isbn: sub.isbn || '',
          tags: sub.tags,
          otherTag: sub.otherTag || ''
        }
        await ref.set(subData)
        ctx.commit('indexSubmission', subData)
        // eslint-disable-next-line  fp/no-mutating-methods
        ids.push(sid)
      }
      const profile = ctx.state.user.profile
      profile.draftBooks = []
      if (!Array.isArray(profile.submissions)) {
        profile.submissions = []
      }
      profile.submissions = [...profile.submissions, ...ids]
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
    indexSubmission(ctx, sid) {
      return new Promise((resolve, reject) => {
        const ref = firebase.database().ref(`submits/books/${sid}`)
        ref.once('value', snap => {
          if (snap.val()) {
            ctx.commit('indexSubmission', snap.val())
            resolve()
            return
          }
          const ref2 = firebase.database().ref(`submits/bundles/${sid}`)
          ref2.once('value', snap2 => {
            if (snap2.val()) {
              ctx.commit('indexSubmission', snap2.val())
            }
            resolve()
          })
        })
      })
    },

    deleteSubmission(ctx, id) {

    },

    // this method doesn't use store to keep values
    // it used only by administrators
    loadContributorsSubmissions(ctx) {
      return new Promise((resolve, reject) => {
        const ref = firebase.database().ref(`submits`)
        ref.once('value', snap => {
          resolve(snap.val())
        })
      })
    },
    // -- same
    loadContributorProfile(ctx, uid) {
      return new Promise((resolve, reject) => {
        const ref = firebase.database().ref(`users/${uid}/profile`)
        ref.once('value', snap => {
          resolve(snap.val())
        })
      })
    },

    // auth
    passwordReset(ctx, email) {
      return new Promise((resolve, reject) => {
        firebase.auth().sendPasswordResetEmail(email)
          .then(res => {
            console.log('reset res', res)
            resolve()
          })
          .catch(err => {
            console.log('reset erroe', err)
            reject(err)
          })
      })
    },

    // start
    async loadStage0(ctx) {
      // const ref = await firebase.database().ref(`people`)
      // await ref.remove()
      await ctx.dispatch('loadTags')
      await ctx.dispatch('loadPeople')
      await ctx.dispatch('loadBooks')
      await ctx.dispatch('content/load')
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
      submissions: [],
      draftBooks: [],
      draftBundles: []
    }
    u.roles = {}
    const userRef = firebase.database().ref(`users/${u.uid}`)
    userRef.on('value', snap => {
      u.profile = { ...u.profile, ...snap.val()?.profile }
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

export default store
