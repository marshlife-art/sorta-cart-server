const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const Product = models.Product
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const getProducts = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    // category sub_category name description
    findParams.where[Op.or] = [
      { name: { [iLike]: `%${q}%` } },
      { description: { [iLike]: `%${q}%` } },
      { sub_category: { [iLike]: `%${q}%` } },
      { category: { [iLike]: `%${q}%` } }
    ]
  }

  // console.log('products findParams:', JSON.stringify(findParams))
  return await Product.findAndCountAll(findParams)
}

const getCategories = async () =>
  Product.aggregate('category', 'DISTINCT', { plain: false })

const getSubCategories = async () =>
  Product.aggregate('sub_category', 'DISTINCT', { plain: false })

module.exports = { getProducts, getCategories, getSubCategories }
