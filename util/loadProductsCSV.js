'use strict'

const csv = require('csv-parser')
const fs = require('fs')

const models = require('../models')

const CODE_COLZ = [
  'a',
  'r',
  'c',
  'l',
  'd',
  'f',
  'g',
  'v',
  'w',
  'y',
  'k',
  'ft',
  'm',
  'og',
  's',
  'n'
]

const KNOWN_HEADERS = [
  'unf',
  'upc_code',
  'name',
  'description',
  'pk',
  'size',
  'unit_type',
  'ws_price',
  'u_price',
  'category',
  'sub_category',
  ...CODE_COLZ
]

const HEADER_MAP = {
  'UPC Code': 'upc_code',
  'Long Name': 'name',
  'Advertising Description': 'description',
  'Unit Type': 'unit_type',
  M: null,
  'W/S Price': 'ws_price',
  'U Price': 'u_price',
  'Category Description': 'sub_category'
}

module.exports = (csv_path, import_tag, vendor) => {
  import_tag = import_tag || `import${Date.now()}`
  vendor = vendor || 'default'

  return new Promise(function(resolve, reject) {
    const results = []
    let cat = ''
    fs.createReadStream(csv_path)
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => {
            if (HEADER_MAP[header]) {
              return HEADER_MAP[header]
            }
            return KNOWN_HEADERS.includes(header) ? header.toLowerCase() : null
          },
          mapValues: ({ header, index, value }) => value.trim()
        })
      )
      .on('data', data => {
        if (data['upc_code'] === '' && data['name'] === '' && data['unf']) {
          // if the first and only field is something, then it's probably a category.
          cat = data['unf']
        } else if (Object.values(data).filter(String).length) {
          data['category'] = cat

          // aggregate codes cols into single col
          let codes = []

          CODE_COLZ.forEach(code => {
            if (data[code]) {
              codes.push(data[code])
            }
            delete data[code]
          })
          data['codes'] = codes.join(', ')

          const ws_price = data['ws_price'].replace('$', '').replace(',', '')
          data['ws_price'] =
            ws_price && !isNaN(parseFloat(ws_price)) ? parseFloat(ws_price) : 0
          const u_price = data['u_price'].replace('$', '').replace(',', '')
          data['u_price'] =
            u_price && !isNaN(parseFloat(u_price)) ? parseFloat(u_price) : 0
          const pk = data['pk'].replace(',', '')
          data['pk'] = pk && !isNaN(parseInt(pk)) ? parseInt(pk) : 0

          data['import_tag'] = import_tag
          data['vendor'] = vendor
          results.push(data)
        }
      })
      .on('end', () => {
        console.log('done reading csv, results.length:', results.length)

        models.Product.bulkCreate(results).then(resolve)
      })
      .on('error', reject)
  })
}
