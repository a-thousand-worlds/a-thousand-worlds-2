const functions = require('firebase-functions')
const admin = require('firebase-admin')

const watchUsers = functions
  /*
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  /**/
  .auth.user()
  .onCreate(async user => {

    const invitesRef = await admin.database().ref('invites')
    invitesRef.once('value', async snap => {
      const invites = snap.val()
      console.log('invites value', invites)
      const inviteCode = Object.keys(invites).find(code => invites[code].email === user.email)
      if (!inviteCode) return
      const invite = invites[inviteCode]
      if (!invite.role || !invite.role.length || invite.used) return

      // setting user role
      const userRef = await admin.database().ref(`users/${user.uid}`)
      await userRef.child('roles').set({
        [invite.role]: true
      })

      // marking invite as used
      await invitesRef.child(`${inviteCode}/used`).set(true)
    })

  })

module.exports = watchUsers
