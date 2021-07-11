const functions = require('firebase-functions')
const admin = require('firebase-admin')

const watchUsers = functions /*
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  /**/.auth
  .user()
  .onCreate(async user => {
    console.log(`New User: ${user.email} (${user.uid})`)

    const invitesRef = await admin.database().ref('invites')
    invitesRef.once('value', async snap => {
      const invites = snap.val()
      const inviteCode = Object.keys(invites).find(code => invites[code].email === user.email)
      if (!inviteCode) {
        console.log('Regular user')
        return
      }
      const invite = invites[inviteCode]

      if (!invite) {
        console.error(`Missing invite record for invite code: ${inviteCode}`)
        return
      } else if (invite.used) {
        console.error(`Invite already used: ${inviteCode}`)
        return
      } else if (!invite.role || !invite.role.length) {
        console.error(`No role for invite code: ${inviteCode}`)
        return
      }

      // set user role
      const userRef = await admin.database().ref(`users/${user.uid}`)
      await userRef.child('roles').set({
        [invite.role]: true,
      })

      // mark invite as used
      await invitesRef.child(`${inviteCode}/used`).set(true)
    })
  })

module.exports = watchUsers
