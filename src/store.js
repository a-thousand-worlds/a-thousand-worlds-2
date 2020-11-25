import { createStore } from 'vuex'
import firebase from './firebase'
import dayjs from 'dayjs'
import { v4 } from 'uuid'
import Jimp from 'jimp'

const store = createStore({
  state: {
    noAccessPath: '',
    stage0: {
      auth: false,
      loaded: false
    },
    loading: false,
    user: null,
    tags: {},
    sortedTags: [],
    people: [],
    books: {},
    bundles: []
  },
  mutations: {
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
    setBooks(ctx, list) {
      ctx.books = list
    },
    setPeople(ctx, list) {
      ctx.people = list
    }
  },
  actions: {
    async addTag(ctx, tag) {
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
      const ref = await firebase.database().ref(`tags/${data.id}`)
      const now = dayjs()
      // ref.once('value',s
      const val = await ref.once('value')
      const snap = val.val()
      console.log('update?', data, snap)
      snap.tag = data.tag
      snap.showOnFront = !!data.showOnFront
      snap.sortOrder = parseInt(data.sortOrder)
      snap.updated = now.format()
      if (!snap.created) {
        snap.created = now.format()
      }
      // console.log('set ref', ref, id)
      console.log('updating ', snap)
      await ref.set(snap)
      return await ctx.dispatch('loadTags')
    },
    async delTag(ctx, tagid) {
      const ref = await firebase.database().ref(`tags/${tagid}`)
      await ref.remove()
      return await ctx.dispatch('loadTags')
    },
    loadTags() {
      return new Promise((resolve, reject) => {
        firebase.database().ref('tags').once('value', snap => {
          console.log('tags', snap.val())
          const v = snap.val()
          store.commit('setTags', v)
          const tags = Object.keys(v).map(k => {
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
          resolve()
        })
      })
    },
    async saveBook(ctx, info) {
      console.log('saving book store', info)
      /**/
      const id = info.book.id && info.book.id.length ? info.book.id : v4()
      // checking and saving authors if not exists
      let i = 0
      // eslint-disable-next-line fp/no-loops
      for (const person of info.book.authors) {
        const exists = ctx.state.people.reduce((acc, x) => {
          console.log('checking', x.name, person)
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
      // uploading photo
      if (typeof info.book.cover === 'string' && info.book.cover.startsWith('http')) {
        photoUrl = info.book.cover
      }
      else {
        console.log('converting and uploading photo')
        const img = await Jimp.read(info.book.cover)
        const buff = await img.getBufferAsync(Jimp.MIME_PNG)
        const photoRef = await firebase.storage().ref(`books/${id}`)
        await photoRef.put(buff, { contentType: 'image/png' })
        photoUrl = await photoRef.getDownloadURL()
      }

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
        description: info.book.description,
        cover: photoUrl,
        publisher: info.book.publisher,
        year: parseInt(info.book.year),
        authors: info.book.authors,
        tags: tags,
        created: created,
        updated: now.format()
      })
      await ctx.dispatch('loadBooks')
    },
    loadBooks(ctx) {
      return new Promise((resolve, reject) => {
        firebase.database().ref('books').once('value', snap => {
          console.log('books', snap.val())
          ctx.commit('setBooks', snap.val())
          resolve()
        })
      })
    },
    async delBook(ctx, id) {
      const ref = await firebase.database().ref(`books/${id}`)
      const refp = await firebase.storage().ref(`books/${id}`)
      await ref.remove()
      try {
        await refp.delete()
      }
      catch (e) {}
      return await ctx.dispatch('loadBooks')
    },
    async savePerson(ctx, info) {
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
      const ref = await firebase.database().ref(`people/${id}`)
      const refp = await firebase.storage().ref(`people/${id}`)
      await ref.remove()
      try {
        await refp.delete()
      }
      catch (e) {}
      return await ctx.dispatch('loadPeople')
    },
    loadPeople() {
      return new Promise((resolve, reject) => {
        firebase.database().ref('people').once('value', snap => {
          const v = snap.val()
          const list = Object.keys(v).map(x => v[x])
          console.log('people', list)
          store.commit('setPeople', list)
          resolve()
        })
      })
    },
    async loadStage0(ctx) {
      // const ref = await firebase.database().ref(`people`)
      // await ref.remove()
      await ctx.dispatch('loadTags')
      await ctx.dispatch('loadBooks')
      await ctx.dispatch('loadPeople')
      ctx.commit('setStage0Load')
    },
    async userLogin(ctx, credentials) {
      return firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
    },
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
    async userRegister(ctx, credentials) {
      let ret = null
      // console.log('reg with', credentials)
      try {
        ret = await firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
      }
      catch (err) {
        ret = null
        console.log('userregister error', err)
      }
      return ret
    }
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
      firstName: '',
      lastName: '',
      bundles: [],
      submissions: []
    }
    u.roles = []
    const userRef = firebase.database().ref(`users/${u.uid}`)
    userRef.on('value', snap => {
      u.profile = snap.val().profile
      u.roles = snap.val().roles
      if (!u.roles) {
        u.roles = {}
      }
      if (!u.roles.authorized) {
        u.roles.authorized = true
      }
      store.commit('setUser', u)
    })
  }
  else {
    console.log('out!')
    store.commit('setUser', null)
  }
})

export default store
