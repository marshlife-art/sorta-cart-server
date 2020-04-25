const assert = require('assert')
const {
  getProducts,
  getCategories,
  getSubCategories,
  destroyProducts
} = require('../../services/product')
const { createFakeProducts } = require('../fixtures/products')

const materialTableFilterExample = require('../fixtures/materialTableFilterExample')

const FAKE_PRODUCT_COUNT = 10

describe('services', function () {
  describe('product', function () {
    before(async function () {
      return createFakeProducts(true, FAKE_PRODUCT_COUNT)
    })

    it('should get products without params', async function () {
      const products = await getProducts({})
      assert.equal(products.count, FAKE_PRODUCT_COUNT)
      assert.equal(products.rows.length, FAKE_PRODUCT_COUNT)
    })

    it('should accept a search query', async function () {
      const products = await getProducts({
        search: '1fake name'
      })
      assert.equal(products.count, 1)
      assert.equal(products.rows.length, 1)
    })

    it('should filter by product codes', async function () {
      const products = await getProducts({
        filters: [
          {
            column: {
              field: 'codes'
            },
            value: ['a', 'b']
          }
        ]
      })
      assert.equal(products.count, FAKE_PRODUCT_COUNT)
      assert.equal(products.rows.length, FAKE_PRODUCT_COUNT)

      const c_product = await getProducts({
        filters: [
          {
            column: {
              field: 'codes'
            },
            value: ['1c']
          }
        ]
      })
      // console.log(
      //   'zomg got proddz with codez:',
      //   c_product.rows.map(p => `${p.name} ${p.codes}`)
      // )
      assert.equal(c_product.count, 1)
      assert.equal(c_product.rows.length, 1)
    })

    it('can hang with empty filterz', async function () {
      const products = await getProducts({
        filters: [{}]
      })
      assert.equal(products.count, FAKE_PRODUCT_COUNT)
      assert.equal(products.rows.length, FAKE_PRODUCT_COUNT)
    })

    it('should accept material-table filter query', async function () {
      const products = await getProducts(materialTableFilterExample)
      assert.equal(products.count, 0)
      assert.equal(products.rows.length, 0)
    })

    it('should get a distinct list of categories', async function () {
      const catz = await getCategories()
      assert.equal(catz.length, 3)
    })

    it('should get a distinct list of sub categories', async function () {
      const subcatz = await getSubCategories()
      assert.equal(subcatz.length, 5)
    })

    it('should destroy products', async function () {
      const products = await getProducts({
        pageSize: 5
      })
      const ids = products.rows.map((p) => p.id)
      assert.equal(ids.length, 5)

      await destroyProducts(ids)
      const productsAfterDestroy = await getProducts({})
      assert.equal(productsAfterDestroy.count, FAKE_PRODUCT_COUNT - 5)
    })
  })
})
