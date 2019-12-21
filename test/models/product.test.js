const assert = require('assert')
const models = require('../../models')

const { PRODUCT, createProduct } = require('../fixtures/products')

describe('models', function() {
  describe('Product', function() {
    let product
    before(async function() {
      product = await createProduct(true)
    })

    it('should create products', async function() {
      // so since product will have lots of extra shit on its prototype, just grab the values of the known keys from PRODUCT object.
      const PRODUCT_KEYS = Object.keys(PRODUCT)
      assert.deepEqual(
        PRODUCT_KEYS.map(k => product[k]),
        PRODUCT_KEYS.map(k => PRODUCT[k])
      )
    })

    it('should delete products', async function() {
      await product.destroy()
      const product_count = await models.Product.count()
      assert.equal(product_count, 0)
    })
  })
})
