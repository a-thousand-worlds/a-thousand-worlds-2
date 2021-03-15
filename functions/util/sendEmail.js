const functions = require('firebase-functions')
const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, html, attachments = []) => {
  const mg = functions.config().mailgun
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 2525,
    auth: {
      user: mg.user,
      pass: mg.password
    }
  })

  let info = {
    error: null
  }
  try {
    info = await transporter.sendMail({
      from: mg.sender,
      to,
      subject,
      html
    })
  }
  catch (error) {
    info.error = error
  }
  return info
}

module.exports = sendEmail
