import axios from 'axios'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

/** Fill a string with data. */
const template = (s, data) =>
  Object.entries(data || {}).reduce(
    (accum, [key, value]) => accum.replace(new RegExp(key, 'g'), value),
    s,
  )

/** Sends an email. Supports basic templating, replacing data keys found in the subject and body with provided values. */
const sendEmail = async ({ to, subject, replyTo, body, data }) => {
  const url = process.env.VUE_APP_EMAIL_URL
  if (!url) {
    throw new Error('Email service url not configured')
  }

  // replace template variables and encode
  const bodyFilled = encodeURIComponent(template(body || '', data))
  const subjectFilled = encodeURIComponent(template(subject || '', data))

  // email sending may be done by guest (contact form) or registered user
  // final permissions are checking inside firebase function
  let token = ''
  const firebasem = await firebaseImport()
  const firebase = firebasem.default
  if (firebase.auth().currentUser) {
    token = await firebase.auth().currentUser.getIdToken()
  }
  return axios
    .get(`${url}?to=${to}&replyTo=${replyTo}&subject=${subjectFilled}&body=${bodyFilled}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
