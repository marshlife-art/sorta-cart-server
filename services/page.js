const models = require('../models')

const Page = models.Page
const Op = models.Sequelize.Op

const getPage = async (id) => {
  return await Page.findOne({ where: { id } })
}

const getAllPages = async () => {
  return await Page.findAndCountAll({ limit: 100, order: [['id', 'DESC']] })
}

const upsertPage = async ({ id, slug, content }) => {
  return await Page.upsert({ id, slug, content })
}

const destroyPage = async ({ id }) => {
  return await Page.destroy({ where: { id: id } })
}

const getLatestPage = async () => {
  return await Page.findOne({
    where: { slug: { [Op.ne]: 'draft' } },
    order: [['id', 'DESC']]
  })
}

module.exports = {
  getPage,
  getAllPages,
  upsertPage,
  destroyPage,
  getLatestPage
}
