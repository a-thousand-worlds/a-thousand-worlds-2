import axios from 'axios'
import * as animal from 'cute-animals'
import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import collectionModule from './modules/collection'
// import { v4 as uid } from 'uuid'

const module = mergeOne(collectionModule('invites'), {
  actions: {

    /** Sends an invitation email. */
    send({ rootGetters }, { code, email, firstName, lastName, role }) {

      // generate email
      const subjectTemplate = rootGetters['content/get'](`email/invite/${role}/subject`)
      const bodyTemplate = rootGetters['content/get'](`email/invite/${role}/body`)

      if (!subjectTemplate) {
        throw new Error(`No email subject found for "${role}"`)
      }
      if (!bodyTemplate) {
        throw new Error(`No email template found for "${role}"`)
      }

      const signupUrl = `${window.location.origin}/signup?code=${code}`

      const template = s => s.replace(/FIRST_NAME/g, firstName || 'friend')
        .replace(/LAST_NAME/g, lastName)
        .replace(/FULL_NAME/g, firstName ? `${firstName} ${lastName}` : 'friend')
        .replace(/SIGNUP_LINK/g, `<a href='${signupUrl}'>${signupUrl}</a>`)

      const subject = template(subjectTemplate)
      const body = template(bodyTemplate)

      const html = `<html>
    <head>
      <style>
        p { margin-bottom: 0; }
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

    /** Creates and sends an invitation for a given role. */
    async createAndSend({ dispatch, rootGetters }, { recipient: { email, firstName, lastName }, role }) {

      if (!email) throw new Error('email required')
      if (!role) throw new Error('role required')

      let code = null

      // generate unique code and save invite record
      // do not overwrite existing record if we have an invitation code collision
      // use a transaction to check existing value and allow retries
      const ref = firebase.database().ref('invites')
      await ref.transaction(invites => {
        code = animal('adj adj animal').replace(/ /g, '-')

        if (!invites) {
          invites = {}
        }

        if (!invites[code]) {
          invites[code] = {
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

      dispatch('send', { code, email, firstName, lastName, role })
    },

  },
})

export default module
