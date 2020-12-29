const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const loadProductsCSV = require('../util/loadProductsCSV')
const loadStock = require('../util/loadStock')
const { parse } = require('json2csv')

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

const getProductStock = async (query) => {
  // this is mostly same as getProducts() fn ++ count_on_hand IS NOT NULL
  // get fucked abstractionz (long live copy&paste!) :/

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

  // push in some special findParams to SELECT products WHERE count_on_hand IS NOT NULL;
  if (findParams.where[Op.and] && findParams.where[Op.and].length) {
    findParams.where[Op.and].push({
      count_on_hand: { [Op.ne]: null }
    })
  } else {
    findParams.where[Op.and] = {
      count_on_hand: { [Op.ne]: null }
    }
  }

  return await Product.findAndCountAll(findParams)
}

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

const addStock = async (dryrun, csvFile) => {
  const products = await loadStock(csvFile)

  let productsUpdated = 0
  let unknownRows = []

  for (const p of products) {
    if (p.zero_key && p.zero_val) {
      console.log(
        'looking for product where p.zero_key:',
        p.zero_key,
        ' = ',
        p.zero_val
      )
      const product = await Product.findOne({
        where: { [p.zero_key]: p.zero_val }
      })
      if (product && !isNaN(parseInt(p.on_hand_change))) {
        if (dryrun === 'false') {
          product.addCountOnHand(p.on_hand_change)
        }
        productsUpdated += 1
      } else {
        const idx = products.indexOf(p)
        unknownRows.push(idx)
      }
    } else {
      console.log('zomg no zero key:', p)
      const idx = products.indexOf(p)
      unknownRows.push(idx)
    }
  }

  return { productsUpdated, unknownRows }
}

const getStockCsv = async () => {
  const products = await Product.findAll({
    where: {
      count_on_hand: { [Op.ne]: null }
    },
    raw: true
  })
  return parse(products)
}

module.exports = {
  getProducts,
  getCategories,
  getSubCategories,
  destroyProducts,
  getProductVendors,
  getProductImportTags,
  getProductStock,
  addProducts,
  addStock,
  getStockCsv
}
