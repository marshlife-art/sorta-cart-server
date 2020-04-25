const models = require('../models')

const Page = models.Page

const getPage = async (slug) => {
  return await Page.findOne({ where: { slug: slug } })
}

const getAllPages = async () => {
  return await Page.findAndCountAll({ limit: 100, order: [['id', 'ASC']] })
}

const upsertPage = async ({ id, slug, content }) => {
  return await Page.upsert({ id, slug, content })
}

const destroyPage = async ({ id }) => {
  return await Page.destroy({ where: { id: id } })
}

module.exports = { getPage, getAllPages, upsertPage, destroyPage }
