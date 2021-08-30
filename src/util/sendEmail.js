import axios from 'axios'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

const sendEmail = async ({ to, subject, body }) => {
  const url = process.env.VUE_APP_EMAIL_URL
  if (!url) {
    throw new Error('Email service url not configured')
  }
  // email sending may be done by guest (contact form) or registered user
  // final permissions are checking inside firebase function
  let token = ''
  const firebasem = await firebaseImport()
  const firebase = firebasem.default
  if (firebase.auth().currentUser) {
    token = await firebase.auth().currentUser.getIdToken()
  }
  return axios
    .get(
      `${url}?to=${to}&subject=${encodeURIComponent(subject)}&html=${encodeURIComponent(body)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .catch(e => {
      console.error(e)
      if (/^Network Error/i.test(e.message)) {
        throw new Error('Network Error. Is the email Firebase function running? ' + url)
      } else {
        throw new Error('Error sending email' + (e.message ? ': ' + e.message : ''))
      }
    })
}

export default sendEmail
