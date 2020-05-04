const mailgun = require('mailgun-js')({
  apiKey:
    process.env.NODE_ENV === 'production'
      ? process.env.MAILGUN_API_KEY
      : process.env.TEST_MAILGUN_API_KEY,
  domain:
    process.env.NODE_ENV === 'production'
      ? process.env.MAILGUN_DOMAIN
      : process.env.TEST_MAILGUN_DOMAIN
})

const HOST =
  process.env.NODE_ENV === 'production'
    ? 'https://www.marshcoop.org'
    : 'http://localhost:3002'
const ADMIN_HOST =
  process.env.NODE_ENV === 'production'
    ? 'https://admin.marshcoop.org'
    : 'http://localhost:3001'

const sendConfirmationEmail = (email, regKey) => {
  return new Promise(function (resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
    } else if (email && regKey) {
      mailgun.messages().send(
        {
          from: 'MARSH COOP <noreply@marshcoop.org>',
          to: email,
          subject: 'Confirm your email',
          text: `Use this link to confirm your email: ${HOST}/confirm?regKey=${regKey}`
        },
        function (error, body) {
          // console.log(body)
          error ? reject(error) : resolve()
        }
      )
    } else {
      reject('invalid user')
    }
  })
}

const sendAdminRegistrationEmail = (email, regKey) => {
  return new Promise(function (resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
    } else if (email && regKey) {
      mailgun.messages().send(
        {
          from: 'MARSH COOP <noreply@marshcoop.org>',
          to: email,
          subject: 'Confirm your email',
          text: `Use this link to confirm your email and complete the registration process. ${ADMIN_HOST}/confirm?regKey=${regKey}`
        },
        function (error, body) {
          // console.log(body)
          error ? reject(error) : resolve()
        }
      )
    } else {
      reject('invalid user')
    }
  })
}

const sendPasswordResetEmail = (email, regKey) => {
  return new Promise(function (resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
    } else if (email && regKey) {
      mailgun.messages().send(
        {
          from: 'MARSH COOP <noreply@marshcoop.org>',
          to: email,
          subject: 'Reset password',
          text: `Use this link to reset your password: ${HOST}/resetpassword?regKey=${regKey}`
        },
        function (error, body) {
          // console.log(body)
          error ? reject(error) : resolve()
        }
      )
    } else {
      reject('invalid user')
    }
  })
}

module.exports = {
  sendConfirmationEmail,
  sendAdminRegistrationEmail,
  sendPasswordResetEmail
}
