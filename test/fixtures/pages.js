const models = require('../../models')

const PAGE = {
  slug: 'test',
  content: `# mark
## down

hello **world**!
`
}

async function createPage() {
  await models.Page.sync({ force: true, match: /_test$/, logging: false })
  return await models.Page.create(PAGE)
}

module.exports = { PAGE, createPage }
