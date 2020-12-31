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

const Handlebars = require('handlebars')
Handlebars.registerHelper('each_when', function (list, k, v, opts) {
  let i,
    result = ''
  for (i = 0; i < list.length; ++i)
    if (list[i][k] == v) result = result + opts.fn(list[i])
  return result
})

const fs = require('fs')
const source = fs.readFileSync('views/orders.handlebars', 'utf8')
const template = Handlebars.compile(source)

const sendOrderConfirmationEmail = (order) => {
  return new Promise(function (resolve, reject) {
    if (process.env.NODE_ENV === 'test') {
      // fuhgeddaboudit!
      resolve()
    } else if (order && order.email) {
      const line_items = order.OrderLineItems || []

      const onHandProducts = line_items.filter(
        (li) => li.kind === 'product' && li.status === 'on_hand'
      )
      const backorderProducts = line_items.filter(
        (li) => li.kind === 'product' && li.status !== 'on_hand'
      )

      const payments = line_items.filter((li) => li.kind === 'payment')
      const paymentsTotal = payments.reduce(
        (acc, v) => acc + parseFloat(`${v.total}`),
        0
      )
      const credits = line_items.filter((li) => li.kind === 'credit')
      const creditsTotal = credits.reduce(
        (acc, v) => acc + parseFloat(`${v.total}`),
        0
      )
      const balance =
        parseFloat(`${order.total}`) +
        parseFloat(`${creditsTotal}`) +
        parseFloat(`${paymentsTotal}`)
      const balanceDue = balance > 0

      mailgun.messages().send(
        {
          from: 'MARSH COOP <noreply@marshcoop.org>',
          to:
            process.env.NODE_ENV === 'development'
              ? 'edward@edwardsharp.net'
              : order.email,
          bcc:
            process.env.NODE_ENV === 'development'
              ? 'MARSH ORDERS <edward@edwardsharp.net>'
              : 'MARSH ORDERS <bioculturalist@gmail.com>',
          subject: 'Your receipt from MARSH COOP',
          // text: 'order receipt'
          html: template(
            {
              orders: [
                {
                  ...order.toJSON(),
                  onHandProducts,
                  backorderProducts
                }
              ],
              balance,
              balanceDue
            },
            {
              allowedProtoProperties: {
                vendor: true,
                description: true,
                quantity: true,
                selected_unit: true,
                price: true,
                total: true
              }
            }
          )
        },
        function (error, body) {
          // error && console.warn(body)
          error ? reject(error) : resolve()
        }
      )
    } else {
      reject('invalid order')
    }
  })
}

module.exports = {
  sendOrderConfirmationEmail
}
