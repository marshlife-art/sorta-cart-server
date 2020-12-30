const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const {
  getProducts,
  getCategories,
  getSubCategories,
  destroyProducts,
  getProductVendors,
  getProductImportTags,
  addProducts,
  getProductStock,
  addStock,
  getStockCsv
} = require('../services/product')

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname)
    }
  }),
  fileFilter: function (req, file, cb) {
    const filetypes = /csv/
    // const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    if (!extname) {
      req.fileValidationError =
        'Error: Product upload only supports .csv files!'
      return cb(null, false, new Error(req.fileValidationError))
    }
    return cb(null, true)
  }
})

module.exports = function (passport) {
  router.post('/products', function (req, res) {
    getProducts(req.body).then((result) =>
      res.json({
        data: result.rows,
        page: req.body && req.body.page ? req.body.page : 0,
        totalCount: result.count
      })
    )
  })

  router.post('/products/stock', function (req, res) {
    getProductStock(req.body).then((result) =>
      res.json({
        data: result.rows,
        page: req.body && req.body.page ? req.body.page : 0,
        totalCount: result.count
      })
    )
  })

  router.get(
    '/products/stock_csv',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getStockCsv()
        .then((data) => {
          res.attachment(`MARSH_ON_HAND_${Date.now()}.csv`)
          res.status(200).send(data)
        })
        .catch((error) => {
          console.warn('stock_csv caught error:', error)
          res.status(500)
        })
    }
  )

  router.get('/categories', function (req, res) {
    return getCategories().then((result) =>
      res.json(
        result
          .map((r) => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.get('/sub_categories', function (req, res) {
    return getSubCategories().then((result) =>
      res.json(
        result
          .map((r) => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.post('/sub_categories', function (req, res) {
    return getSubCategories(req.body).then((result) =>
      res.json(
        result
          .map((r) => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.post(
    '/products/destroy',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      const { ids } = req.body
      return destroyProducts(ids)
        .then(() => res.json({ msg: 'products destroyed!' }))
        .catch((err) =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to destroy products ${err}`
          })
        )
    }
  )

  router.get('/products/vendors', function (req, res) {
    return getProductVendors().then((result) =>
      res.json(
        result
          .map((r) => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.get('/products/import_tags', function (req, res) {
    return getProductImportTags().then((result) =>
      res.json(
        result
          .map((r) => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.post(
    '/products/upload',
    passport.authenticate('jwt', { session: false }),
    upload.single('file'),
    function (req, res, next) {
      if (req.fileValidationError) {
        res.send({ error: req.fileValidationError })
      } else {
        const {
          vendor,
          import_tag,
          prev_import_tag,
          markup,
          force_check
        } = req.body
        if (!vendor || !import_tag) {
          fs.unlink(req.file.path, () => {})
          res.status(500).json({
            error: true,
            msg: `You must include a vendor and import tag string!`
          })
        } else {
          addProducts(
            vendor,
            import_tag,
            req.file.path,
            prev_import_tag,
            markup,
            force_check
          )
            .then((response) => res.json({ msg: response }))
            .catch((err) => {
              // console.log('err err?.original?.detail:', err?.original?.detail)
              let msg = `Unable to import products! ${err}. \n`
              if (err?.original?.detail) {
                msg += `${err?.original?.detail} \n`
              }
              if (err.errors && err.errors.length) {
                msg += err.errors.reduce((acc, v) => {
                  acc = `${acc ? `${acc}, \n` : ''}${v.message}`
                  return acc
                }, '')
              }
              return res.status(500).json({
                error: true,
                msg
              })
            })
            .finally(() => {
              fs.unlink(req.file.path, () => {})
            })
        }
      }
    }
  )

  //addStock
  router.post(
    '/products/add_stock',
    passport.authenticate('jwt', { session: false }),
    upload.single('file'),
    function (req, res, next) {
      if (req.fileValidationError) {
        res.send({ error: req.fileValidationError })
      } else {
        const { dryrun } = req.body
        addStock(dryrun, req.file.path)
          .then((res) => {
            const unknownRowsString = res.unknownRows.length
              ? `${res.unknownRows.length} rows didn't match a product: ${res.unknownRows}`
              : ''
            if (dryrun === 'false') {
              return `${res.productsUpdated} products updated. ${unknownRowsString}`
            } else {
              return `Dry Run! ${res.productsUpdated} products will get updated. ${unknownRowsString}`
            }
          })
          .then((response) => res.json({ msg: response }))
          .catch((err) =>
            res.status(500).json({
              error: true,
              msg: `Unable to add stock! ${err}`
            })
          )
          .finally(() => {
            fs.unlink(req.file.path, () => {})
          })
      }
    }
  )

  return router
}
