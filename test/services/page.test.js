const assert = require('assert')
const { createPage } = require('../fixtures/pages')
const {
  getPage,
  getAllPages,
  upsertPage,
  destroyPage
} = require('../../services/page')

describe('services', function () {
  describe('page', function () {
    before(async function () {
      return await createPage()
    })

    it('should be able get a page', async function () {
      const slug = 'test'
      const page = await getPage(slug)
      assert.equal(page.slug, slug)
    })

    it('should be able create a page', async function () {
      const new_page = { slug: 'new_page', content: 'foobar' }
      await upsertPage(new_page)
      const page = await getPage(new_page.slug)
      assert.equal(page.slug, new_page.slug)
      assert.equal(page.content, new_page.content)
    })

    it('should be able update a page', async function () {
      const page = await getPage('new_page')
      await upsertPage({ id: page.id, content: 'zomg' })
      const pageAfterEdit = await getPage('new_page')
      assert.equal(pageAfterEdit.slug, 'new_page')
      assert.equal(pageAfterEdit.content, 'zomg')
    })

    it('should be able to destroy a page', async function () {
      const pages = await getAllPages()
      const pages_count = pages.count
      await destroyPage({ id: pages.rows[0].id })
      const pagesAfterDestory = await getAllPages()
      assert.equal(pagesAfterDestory.count, pages_count - 1)
    })
  })
})
