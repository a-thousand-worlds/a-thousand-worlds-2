import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import collectionModule from './collectionModule'

const module = mergeOne(collectionModule('users'), {
  actions: {

    login(ctx, data) {
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    },

    async updateEmail(state, email) {
      const user = firebase.auth().currentUser
      if (user.email !== email) {
        await user.updateEmail(email)
      }
    },

    async signup({ commit, dispatch, rootState }, { code, email, name, organization, otherEngagementCategory, password }) {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)
      await commit('setUser', { uid: user.uid }, { root: true })

      // add role from signup code
      const invite = rootState.invites.data[code]
      const roles = invite ? {
        roles: {
          [invite.role]: true
        }
      } : null

      // save profile to user record
      await dispatch('saveProfile', {
        email,
        code,
        name,
        organization,
        otherEngagementCategory,
        ...roles,
      }, { root: true })

      // mark signup code as used
      await firebase.database().ref(`invites/${code}/used`).set(Date.now())

      return user
    },
  }
})

export default module
