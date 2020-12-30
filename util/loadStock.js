'use strict'

const csv = require('csv-parser')
const fs = require('fs')

const KNOWN_HEADERS = [
  'unf',
  'upc_code',
  'count_on_hand',
  'count_on_hand_change',
  'no_backorder'
]

const HEADER_MAP = {
  'UPC Code': 'upc_code',
  on_hand_count: 'count_on_hand',
  on_hand_count_change: 'count_on_hand_change'
}

module.exports = (csv_path) => {
  return new Promise(function (resolve, reject) {
    const results = []
    const errors = []
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
      .on('data', (data) => {
        try {
          // console.log('have data:', data)
          // no_backorder is BOOLEAN type
          data['no_backorder'] = !!data['no_backorder']
          results.push(data)
        } catch (e) {
          errors.push(`error (${e}) processing row: unf: ${data}`)
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
