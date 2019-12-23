const models = require('../../models')

const WHOLESALE_ORDER = {
  vendor: 'test',
  notes: 'testing wholesale order',
  status: 'new',
  data: {}
}

async function createWholesaleOrderFixture(sync) {
  if (sync) {
    await models.WholesaleOrder.sync({
      force: true,
      match: /_test$/,
      logging: false
    })
  }
  return await models.WholesaleOrder.create(WHOLESALE_ORDER)
}

module.exports = { WHOLESALE_ORDER, createWholesaleOrderFixture }
