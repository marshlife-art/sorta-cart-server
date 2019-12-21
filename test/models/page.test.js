const assert = require('assert')
const models = require('../../models')

const { PAGE, createPage } = require('../fixtures/pages')

describe('models', function() {
  describe('Page', function() {
    let page
    before(async function() {
      page = await createPage()
    })

    it('should create pages', async function() {
      assert.equal(page.slug, PAGE.slug)
      assert.equal(page.content, PAGE.content)
    })

    it('should delete pages', async function() {
      await page.destroy()
      const page_count = await models.Page.count()
      assert.equal(page_count, 0)
    })
  })
})
