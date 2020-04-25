const path = require('path')
const assert = require('assert')
const models = require('../../models')
const loadProductsCSV = require('../../util/loadProductsCSV')

describe('util', function () {
  describe('loadProductsCSV', function () {
    before(async function () {
      return await models.Product.sync({
        force: true,
        match: /_test$/,
        logging: false
      })
    })

    it('should be able to parse .csv files into new products and apply markup', async function () {
      const markup = 0.1
      const products = await loadProductsCSV(
        path.resolve(__dirname, '../fixtures/unfi_edit_short.csv'),
        'import_tag_test',
        'unfi',
        markup
      )

      assert.equal(products.length, 5)
      products.forEach((product) => {
        assert.equal(
          product.ws_price,
          product.ws_price_cost + product.ws_price_cost * markup
        )
        assert.equal(
          product.u_price,
          product.u_price_cost + product.u_price_cost * markup
        )
      })
    })

    it('should parse rows with special markup prices', async function () {
      const markup = 0.1
      const products = await loadProductsCSV(
        path.resolve(
          __dirname,
          '../fixtures/unfi_edit_short_has_one_special_markup.csv'
        ),
        'import_tag_test',
        'unfi',
        markup
      )

      assert.equal(products.length, 5)

      products.forEach((product, idx) => {
        if (idx === 0) {
          // the first product has the special markup specified on the sheet.
          assert.equal(product.ws_price_cost, 33.64)
          assert.equal(product.ws_price, 66.0)
          assert.equal(product.u_price_cost, 3.36)
          assert.equal(product.u_price, 6.66)
        } else {
          // the rest have 10% markup
          assert.equal(
            product.ws_price,
            product.ws_price_cost + product.ws_price_cost * markup
          )
          assert.equal(
            product.u_price,
            product.u_price_cost + product.u_price_cost * markup
          )
        }
      })
    })

    it('should process code columns', async function () {
      const products = await loadProductsCSV(
        path.resolve(__dirname, '../fixtures/unfi_edit_short_has_codes_col.csv')
      )

      assert.equal(products.length, 5)
      assert.equal(products[0]['codes'], 'a, c, f, n')
    })

    it('should reject bad files', async function () {
      await loadProductsCSV(
        path.resolve(__dirname, '../fixtures/trash.csv')
      ).catch((error) => {
        assert.equal(error, 'no products found in uploaded file!')
      })
    })

    it('should reject if no file found', async function () {
      await loadProductsCSV(
        path.resolve(__dirname, 'i/do/not/exist.csv')
      ).catch((error) => {
        assert.equal(error, 'could not find a .csv file!')
      })
    })

    it('should reject files with $0.00 ws_price', async function () {
      await loadProductsCSV(
        path.resolve(__dirname, '../fixtures/unfi_edit_short_has_zero_val2.csv')
      ).catch((error) => {
        // error (ws_price is 0!) processing row: unf: 175065-2 upc_code: 8-11751-00210-2, name: YINGS, description: SAUCE,SWEET & SOUR
        assert.equal(/^error \(ws_price is 0!\)/.test(error), true)
      })
    })

    it('should reject files with no u_price', async function () {
      await loadProductsCSV(
        path.resolve(__dirname, '../fixtures/unfi_edit_short_has_zero_val.csv')
      ).catch((error) => {
        assert.equal(/^error \(u_price is 0!\)/.test(error), true)
      })
    })
  })
})
