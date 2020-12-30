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
  markup,
  force_check
) => {
  const productsOnHand = await Product.findAll({
    attributes: ['id', 'unf', 'upc_code', 'count_on_hand'],
    where: {
      count_on_hand: {
        [Op.and]: {
          [Op.ne]: null,
          [Op.ne]: 0
        }
      }
    },
    raw: true
  })

  const products = await loadProductsCSV(csvFile, import_tag, vendor, markup)

  console.log('zomg sooo productsOnHand:', productsOnHand)
  const onHandIntersect = productsOnHand.map((oh) =>
    products.find((p) => p.unf === oh.unf && p.upc_code === oh.upc_code)
  )
  console.log('onHandIntersect: ', onHandIntersect)

  let existingIdsToDestroy = productsOnHand.reduce((acc, oh) => {
    const product = products.find(
      (p) => p.unf === oh.unf && p.upc_code === oh.upc_code
    )
    if (product) {
      product.count_on_hand = oh.count_on_hand
      acc.push(oh.id)
    }
    return acc
  }, [])

  if (force_check === 'true') {
    console.log('zomg force_check true!!!!!')
    const existingProductsToDestroy = []
    for await (const p of products) {
      const product = await Product.findOne({
        attributes: ['id', 'count_on_hand'],
        where: { unf: p.unf, upc_code: p.upc_code },
        raw: true
      })
      if (product) {
        p.count_on_hand = product.count_on_hand
        existingProductsToDestroy.push(product.id)
      }
    }

    existingIdsToDestroy = [
      ...existingIdsToDestroy,
      ...existingProductsToDestroy
    ]
  }

  console.log('existingIdsToDestroy:', existingIdsToDestroy)
  return models.sequelize.transaction((transaction) => {
    // chain transaction queries here; make sure to return them.
    if (
      (prev_import_tag !== undefined && prev_import_tag !== '') ||
      (existingIdsToDestroy && existingIdsToDestroy.length)
    ) {
      let where = {}
      if (prev_import_tag !== undefined && prev_import_tag !== '') {
        where = { import_tag: prev_import_tag }
      }
      if (existingIdsToDestroy && existingIdsToDestroy.length) {
        where = { [Op.or]: { ...where, id: existingIdsToDestroy } }
      }
      console.log('destroy where:', where)
      return Product.destroy({ where, transaction }).then((destroyResponse) => {
        return Product.bulkCreate(products, {
          transaction
        }).then((response) => {
          return `success! first destroyed ${destroyResponse} products and then created ${response.length} products.`
        })
      })
    } else {
      return Product.bulkCreate(products).then((response) => {
        return `success! created ${response.length} products!`
      })
    }
  })
}

const addStock = async (dryrun, csvFile) => {
  const products = await loadStock(csvFile)

  let productsUpdated = 0
  let unknownRows = []

  for (const p of products) {
    if (p.unf || p.upc_code) {
      console.log(
        'looking for product where p.unf:',
        p.unf,
        ' and upc_code:',
        p.upc_code
      )
      const product = await Product.findOne({
        where: { unf: p.unf, upc_code: p.upc_code }
      })
      if (
        product &&
        (!isNaN(parseInt(p.count_on_hand_change)) ||
          !isNaN(parseInt(p.count_on_hand)) ||
          product.no_backorder !== p.no_backorder)
      ) {
        if (dryrun === 'false') {
          //first check count_on_hand for hard count, then count_on_hand_change
          if (!isNaN(parseInt(p.count_on_hand))) {
            console.log('hard count_on_hand')
            product.count_on_hand = parseInt(p.count_on_hand)
            product.save()
          } else if (!isNaN(parseInt(p.count_on_hand_change))) {
            product.addCountOnHand(p.count_on_hand_change)
          }
          if (product.no_backorder !== p.no_backorder) {
            product.no_backorder = !!p.no_backorder
            product.save()
          }
        }
        productsUpdated += 1
      } else {
        console.log(
          'adding unknownRows cuz no product and count_on_hand_change or count_on_hand',
          ' !isNaN(parseInt(p.count_on_hand_change)):',
          !isNaN(parseInt(p.count_on_hand_change)),
          ' !isNaN(parseInt(p.count_on_hand)):',
          !isNaN(parseInt(p.count_on_hand)),
          ' sooo p:',
          p
        )
        unknownRows.push(`unf: '${p.unf}' upc_code: '${p.upc_code}'`)
      }
    } else {
      console.log('zomg no unf and upc_code:', p)
      const idx = products.indexOf(p)
      unknownRows.push(`no unf and upc_code idx:${idx}`)
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
