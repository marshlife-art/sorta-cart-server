const models = require('../models')
const User = models.User

if (process.argv[2] && process.argv[3]) {
  User.create({
    email: process.argv[2],
    password: process.argv[3],
    role: 'admin'
  })
    .then(() => {
      console.log(`created admin ${process.argv[2]}`)
      process.exit()
    })
    .catch((err) => {
      console.warn(`ERROR! ${err}`)
      process.exit()
    })
} else {
  console.log('ERROR! please specify a user and password arguments')
}
