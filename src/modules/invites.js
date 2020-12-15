import axios from 'axios'
import * as animal from 'cute-animals'
import firebase from '@/firebase'
import { firebaseGet } from '@/utils'
// import { v4 as uid } from 'uuid'

const module = {
  namespaced: true,
  state: () => ({
    data: {},
    loaded: false,
  }),
  mutations: {
    set(state, data) {
      state.data = data
      state.loaded = true
    },
  },
  getters: {
    /** Gets the invites of the given key, or its default. */
    getById: state => id => {
      return state.data[id]
    },
    /**
     * Find an entry in the collection by a given key.
     * @param key    The key to match. Supports _.get key expressions.
     * @param value  The value to match. Accepts a predicate that takes the deep value returned by the key expression.
     */
    findBy: state => (key, value) => {
      return Object.entries(state.data).find(
        ([entryKey, entryValue]) => {
          const deepValue = _.get(entryValue, key)
          return typeof value === 'function'
            ? value(deepValue)
            : deepValue === value
        }
      )
    },
  },
  actions: {

    /** Loads the invites collection from Firebase once. */
    async load(state) {
      const value = await firebaseGet('invites')
      const valueNotNull = value || {}
      state.commit('set', value || {})
      return valueNotNull
    },

    /** Sends an invite for a given role. */
    async send(state, { recipient: { email, firstName, lastName }, role }) {

      if (!email) throw new Error('email required')
      if (!role) throw new Error('role required')

      let invite = null

      // generate unique code and save invite record
      // do not overwrite existing record if we have an invitation code collision
      // use a transaction to check existing value and allow retries
      const ref = firebase.database().ref('invites')
      await ref.transaction(invites => {
        const code = animal('adj adj animal').replace(/ /g, '-')

        if (!invites) {
          invites = {}
        }

        if (!invites[code]) {
          invite = invites[code] = {
            code,
            created: Date.now(),
            email,
            firstName,
            lastName,
            role,
          }
        }

        return invites
      })

      // generate email
      const template = state.rootGetters['content/get'](`email-invite-${role}`)
      if (!template) {
        throw new Error(`No template found for "${role}"`)
      }

      const signupUrl = `${window.location.origin}/signup?code=${invite.code}`

      const subject = 'Hello'

      const body = template
        .replace(/FIRST_NAME/g, firstName || 'friend')
        .replace(/LAST_NAME/g, lastName)
        .replace(/FULL_NAME/g, firstName ? `${firstName} ${lastName}` : 'friend')
        .replace(/SIGNUP_LINK/g, `<a href='${signupUrl}'>${signupUrl}</a>`)

      const html = `<html>
    <head>
      <style>
        p {
          margin-bottom: 0;
        }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>
  `

      // send email
      // await firebase.database().collection('mail').doc(uid()).set({
      //   test: 'hello',
      //   html,
      // })

      // TODO: Secure email function or switch completely to Cloud Firestore
      // https://www.notion.so/rainerevere/2-0-0c2ad3c668dc4b8289e856a30cb5c5e2#2acc0dd0689f4ae6928f74960c1a3cf4
      // https://stackoverflow.com/questions/42751074/how-to-protect-firebase-cloud-function-http-endpoint-to-allow-only-firebase-auth
      // https://www.notion.so/rainerevere/2-0-0c2ad3c668dc4b8289e856a30cb5c5e2#4ca75277c89c4db39335ffb1e6a00718
      return axios.get(`${process.env.VUE_APP_EMAIL_URL}?to=${email}&subject=${subject}&html=${encodeURIComponent(html)}`)
    },

    /** Subscribes to the invites collection in Firebase, syncing with this.data */
    subscribe(state) {
      const ref = firebase.database().ref('invites')
      ref.on('value', snap => {
        state.commit('set', snap.val() || {})
      })
    },

  },
}

export default module
