'use strict'

const csv = require('csv-parser')
const fs = require('fs')

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
  'ws_price_markup',
  'u_price_markup',
  'category',
  'sub_category',
  'codes',
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

module.exports = (csv_path, import_tag, vendor, markup) => {
  import_tag = import_tag || `import${Date.now()}`
  vendor = vendor || 'default'
  markup = markup || 0.0

  return new Promise(function(resolve, reject) {
    const results = []
    const errors = []
    let cat = ''
    if (!fs.existsSync(csv_path)) {
      reject('could not find a .csv file!')
      return
    }
    fs.createReadStream(csv_path)
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => {
            if (HEADER_MAP[header]) {
              return HEADER_MAP[header]
            }
            return KNOWN_HEADERS.includes(header.toLowerCase())
              ? header.toLowerCase()
              : null
          },
          mapValues: ({ header, index, value }) => value.trim()
        })
      )
      .on('data', data => {
        try {
          if (
            data['upc_code'] === '' &&
            data['name'] === '' &&
            data['description'] === '' &&
            data['unf']
          ) {
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
            if (data['codes']) {
              data['codes'] = [
                ...data['codes'].split(',').map(s => s.trim()),
                ...codes
              ].join(', ')
            } else {
              data['codes'] = codes.join(', ')
            }

            // WS_PRICE && MARKUPZ
            const ws_price =
              data['ws_price'] &&
              data['ws_price'].replace('$', '').replace(',', '')

            data['ws_price'] =
              ws_price && !isNaN(parseFloat(ws_price))
                ? parseFloat(ws_price)
                : 0
            if (data['ws_price'] === 0) {
              throw 'ws_price is 0!'
            }
            // in the database we track ws_price_cost instead of _markup so switch those around:
            data['ws_price_cost'] = data['ws_price']

            const ws_price_markup =
              data['ws_price_markup'] &&
              data['ws_price_markup'].replace('$', '').replace(',', '')

            data['ws_price_markup'] =
              ws_price_markup && !isNaN(parseFloat(ws_price_markup))
                ? parseFloat(ws_price_markup)
                : 0

            // so then if there's no ws_price_markup specified, apply the global markup.
            if (data['ws_price_markup'] === 0) {
              data['ws_price_markup'] =
                data['ws_price'] + data['ws_price'] * markup
              data['ws_price'] = data['ws_price'] + data['ws_price'] * markup
            } else {
              data['ws_price'] = data['ws_price_markup']
            }

            delete data['ws_price_markup']

            // U_PRICE && MARKUPZ
            const u_price =
              data['u_price'] &&
              data['u_price'].replace('$', '').replace(',', '')

            data['u_price'] =
              u_price && !isNaN(parseFloat(u_price)) ? parseFloat(u_price) : 0
            if (data['u_price'] === 0) {
              throw 'u_price is 0!'
            }
            // in the database we track ws_price_cost instead of _markup so switch those around:
            data['u_price_cost'] = data['u_price']

            const u_price_markup =
              data['u_price_markup'] &&
              data['u_price_markup'].replace('$', '').replace(',', '')

            data['u_price_markup'] =
              u_price_markup && !isNaN(parseFloat(u_price_markup))
                ? parseFloat(u_price_markup)
                : 0
            // ...so then if there's no u_price_markup specified, apply the global markup.
            if (data['u_price_markup'] === 0) {
              data['u_price_markup'] =
                data['u_price'] + data['u_price'] * markup
              data['u_price'] = data['u_price'] + data['u_price'] * markup
            } else {
              data['u_price'] = data['u_price_markup']
            }

            delete data['u_price_markup']

            const pk = data['pk'] && data['pk'].replace(',', '')
            data['pk'] = pk && !isNaN(parseInt(pk)) ? parseInt(pk) : 1 // i guess default 1 makes sense here

            data['import_tag'] = import_tag
            data['vendor'] = vendor
            results.push(data)
          }
        } catch (e) {
          errors.push(
            `error (${e}) processing row: unf: ${data['unf']} upc_code: ${data['upc_code']}, name: ${data['name']}, description: ${data['description']}`
          )
        }
      })
      .on('end', () => {
        if (errors.length) {
          reject(errors.join('\n\n'))
        } else if (results.length === 0) {
          reject('no products found in uploaded file!')
        } else {
          resolve(results)
        }
      })
      .on('error', reject)
  })
}
