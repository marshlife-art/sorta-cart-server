const crypto = require('crypto')
const squareConnect = require('square-connect')

// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance
// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2']
oauth2.accessToken = process.env.SQUARE_TOKEN
// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com'
//process.env.NODE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com'

async function createPayment(nonce, amountCents, note) {
  // length of idempotency_key should be less than 45
  const idempotency_key = crypto.randomBytes(22).toString('hex')

  // Charge the customer's card
  const payments_api = new squareConnect.PaymentsApi()
  const request_body = {
    source_id: nonce,
    amount_money: {
      amount: amountCents,
      currency: 'USD'
    },
    note: note,
    idempotency_key: idempotency_key
  }

  return await payments_api.createPayment(request_body)
}

module.exports = {
  createPayment
}
