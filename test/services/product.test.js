const assert = require('assert')
const {
  getProducts,
  getCategories,
  getSubCategories
} = require('../../services/product')
const { createFakeProducts } = require('../fixtures/products')

const materialTableFilterExample = require('../fixtures/materialTableFilterExample')

const FAKE_PRODUCT_COUNT = 10

describe('services', function() {
  describe('product', function() {
    before(async function() {
      return createFakeProducts(true, FAKE_PRODUCT_COUNT)
    })

    it('should get products without params', async function() {
      const products = await getProducts({})
      assert.equal(products.count, FAKE_PRODUCT_COUNT)
      assert.equal(products.rows.length, FAKE_PRODUCT_COUNT)
    })

    // ugh, this doesn't work with sqlite!
    it('should accept a search query', async function() {
      const products = await getProducts({
        search: '1fake name'
      })
      assert.equal(products.count, 1)
      assert.equal(products.rows.length, 1)
    })

    it('should accept material-table filter query', async function() {
      const products = await getProducts(materialTableFilterExample)
      assert.equal(products.count, 0)
      assert.equal(products.rows.length, 0)
    })

    it('should get a distinct list of categories', async function() {
      const catz = await getCategories()
      assert.equal(catz.length, 3)
    })

    it('should get a distinct list of sub categories', async function() {
      const subcatz = await getSubCategories()
      assert.equal(subcatz.length, 5)
    })
  })
})
