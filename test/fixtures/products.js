const models = require('../../models')

async function syncProducts() {
  await models.Product.sync({ force: true, match: /_test$/, logging: false })
}

const PRODUCT = {
  unf: 'unf1234',
  upc_code: 'upc-1234',
  category: 'BULK FOOD',
  sub_category: 'TEST PRODUCTZ',
  name: 'TEST',
  description: 'JUST A TEST PRODUCT',
  pk: 1,
  size: '1 unit',
  unit_type: 'CS',
  ws_price: 666.66,
  u_price: 66,
  codes: 'a,b,c'
}

async function createProduct(sync, product) {
  if (sync) {
    await syncProducts()
  }
  product = product || PRODUCT
  // console.log(`CREATING PRODUCT "${product.name}"`)
  return await models.Product.create(product)
}

function fakeProduct(i) {
  return {
    unf: 'unf1234',
    upc_code: 'upc-1234',
    category: `${i % 3}fake category`,
    sub_category: `${i % 5}fake sub category`,
    name: `${i}fake name`,
    description: `${i}fake description`,
    pk: i + 1,
    size: '1 unit',
    unit_type: 'CS',
    ws_price: 666.66,
    u_price: 66,
    codes: 'a,b,c'
  }
}

async function createFakeProducts(sync, howMany) {
  howMany = howMany || 1
  if (sync) {
    await syncProducts()
  }

  for (let i = 0; i < howMany; i++) {
    createProduct(false, fakeProduct(i))
  }
}

module.exports = { PRODUCT, createProduct, createFakeProducts }
