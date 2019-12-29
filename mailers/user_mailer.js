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

const sendRegistrationEmail = (email, regKey) => {
  return new Promise(function(resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
    } else if (email && regKey) {
      mailgun.messages().send(
        {
          from: 'MARSH COOP <noreply@marshcoop.org>',
          to: email,
          subject: 'Confirm your email',
          text: `Use this link to confirm your email and complete the registration process. https://admin.marshcoop.org/register?regKey=${regKey}`
        },
        function(error, body) {
          console.log(body)
          error ? reject(error) : resolve()
        }
      )
    } else {
      reject('invalid user')
    }
  })
}

module.exports = {
  sendRegistrationEmail
}
