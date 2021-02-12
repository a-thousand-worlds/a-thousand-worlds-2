import axios from 'axios'
import firebase from '@/firebase'

// TODO: Secure email function or switch completely to Cloud Firestore
// https://www.notion.so/rainerevere/2-0-0c2ad3c668dc4b8289e856a30cb5c5e2#2acc0dd0689f4ae6928f74960c1a3cf4
// https://stackoverflow.com/questions/42751074/how-to-protect-firebase-cloud-function-http-endpoint-to-allow-only-firebase-auth
// https://www.notion.so/rainerevere/2-0-0c2ad3c668dc4b8289e856a30cb5c5e2#4ca75277c89c4db39335ffb1e6a00718
const sendEmail = async ({ to, subject, body }) => {
  const url = process.env.VUE_APP_EMAIL_URL
  if (!url) {
    throw new Error('Email service url not configured')
  }
  const token = await firebase.auth().currentUser.getIdToken()
  return axios.get(`${url}?to=${to}&subject=${encodeURIComponent(subject)}&html=${encodeURIComponent(body)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export default sendEmail
