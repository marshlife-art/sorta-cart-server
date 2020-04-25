const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const loadProductsCSV = require('../util/loadProductsCSV')

const Product = models.Product
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const getProducts = async (query) => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    const filters = [
      {
        name: { [Op.and]: q.split(' ').map((val) => ({ [iLike]: `%${val}%` })) }
      },
      {
        description: {
          [Op.and]: q.split(' ').map((val) => ({ [iLike]: `%${val}%` }))
        }
      },
      { sub_category: { [iLike]: `%${q}%` } },
      { category: { [iLike]: `%${q}%` } }
    ]

    if (findParams.where[Op.or] && findParams.where[Op.or].length) {
      findParams.where[Op.or].push(filters)
    } else {
      findParams.where[Op.or] = filters
    }
  }

  return await Product.findAndCountAll(findParams)
}

const getCategories = async () =>
  Product.aggregate('category', 'DISTINCT', { plain: false })

const getSubCategories = async (reqBody) => {
  const { categories } = reqBody || {}
  if (categories && categories.length) {
    return Product.aggregate('sub_category', 'DISTINCT', {
      plain: false,
      where: { category: { [Op.or]: categories } }
    })
  } else {
    return Product.aggregate('sub_category', 'DISTINCT', { plain: false })
  }
}

const destroyProducts = async (ids) => {
  return await Product.destroy({
    where: {
      id: {
        [Op.or]: ids
      }
    }
  })
}

const getProductVendors = async () =>
  Product.aggregate('vendor', 'DISTINCT', { plain: false })

const getProductImportTags = async () =>
  Product.aggregate('import_tag', 'DISTINCT', { plain: false })

const addProducts = async (
  vendor,
  import_tag,
  csvFile,
  prev_import_tag,
  markup
) => {
  return loadProductsCSV(csvFile, import_tag, vendor, markup).then(
    (products) => {
      return models.sequelize.transaction((t) => {
        // chain all your queries here. make sure you return them.
        if (prev_import_tag !== undefined && prev_import_tag !== '') {
          return Product.destroy(
            { where: { import_tag: prev_import_tag } },
            { transaction: t }
          ).then((destroyResponse) => {
            return Product.bulkCreate(products, { transaction: t }).then(
              (response) => {
                return `success! first destroyed ${destroyResponse} products and then created ${response.length} products.`
              }
            )
          })
        } else {
          return Product.bulkCreate(products).then((response) => {
            return `success! created ${response.length} products!`
          })
        }
      })
    }
  )
}

module.exports = {
  getProducts,
  getCategories,
  getSubCategories,
  destroyProducts,
  getProductVendors,
  getProductImportTags,
  addProducts
}
