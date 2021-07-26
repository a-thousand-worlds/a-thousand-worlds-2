/** Vuex module for users collection */
import sortBy from 'lodash/sortBy'
import slugify from '@sindresorhus/slugify'

// import firebase from '@/firebase'
import collectionModule, { firebaseGet } from './modules/collection'
import mergeOne from '@/util/mergeOne'
import setCacheRequired from '@/util/setCacheRequired'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

const module = mergeOne(collectionModule('users'), {
  getters: {
    /** Returns a list of contributors and owner dropdown options sorted by name. */
    contributorOptions: state => {
      const contributorsAndOwners = state.loaded
        ? Object.entries(state.data).filter(
            ([id, user]) => user.roles?.contributor || user.roles?.owner,
          )
        : []
      const contributorOptions = contributorsAndOwners.map(([id, user]) => {
        const fullName =
          user.profile.name ||
          (user.profile.firstName
            ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
            : '')
        return { id, ...user, text: `${fullName}${user.roles.owner ? ' (owner)' : ''}` }
      })
      return sortBy(contributorOptions, 'text')
    },
  },
  actions: {
    // saves a new contributor user profile that is not attached to a login and cannot be authenticated
    // useful for manually adding contributor information to books that are already in the directory when the contributor doesn't have an account yet
    async saveContributor(ctx, profile) {
      if (!profile.name) {
        throw new Error('User name required')
      }

      const uid = slugify(profile.name)
      const newUserPath = `users/${uid}`

      // to be safe, make sure a user has not already been created with the same name
      const user = await firebaseGet(newUserPath)
      if (user) {
        console.error('User exists:', user)
        throw new Error(`User '${profile.name}' already exists`)
      }

      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      await firebase
        .database()
        .ref(newUserPath)
        .set({
          profile: {
            ...profile,
            noLogin: true,
          },
          roles: {
            contributor: true,
          },
        })
      await setCacheRequired()

      return uid
    },
  },
})

export default module
