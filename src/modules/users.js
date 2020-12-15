import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import collectionModule from './collectionModule'

const module = mergeOne(collectionModule('users'), {
  actions: {

    login(ctx, data) {
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    },

    async signup({ commit, dispatch, state }, { code, email, name, organization, otherEngagementCategory, password }) {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)
      await commit('setUser', { uid: user.uid }, { root: true })

      // add role from signup code
      const invite = state.invites.data[code]
      const roles = invite ? {
        roles: {
          [invite.role]: true
        }
      } : null

      await dispatch('saveProfile', {
        email,
        name,
        organization,
        otherEngagementCategory,
        ...roles,
      }, { root: true })

      return user
    },
  }
})

export default module
