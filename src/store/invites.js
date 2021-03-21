import * as animal from 'cute-animals'
import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import sendEmail from '@/util/sendEmail'
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
        p { margin: 0; }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>
  `

      return sendEmail({ to: email, subject, body: html })
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

      return dispatch('send', { code, email, firstName, lastName, role })
    },

  },
})

export default module
