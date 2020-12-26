'use strict'

const csv = require('csv-parser')
const fs = require('fs')

const KNOWN_HEADERS = [
  'id',
  'unf',
  'upc_code',
  'name',
  'description',
  'on_hand_change'
]

const HEADER_MAP = {
  'UPC Code': 'upc_code',
  'Long Name': 'name',
  'Advertising Description': 'description',
  M: null
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
            if (index === 0) {
              return `zeroindex__${header}`
            }
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

          const zkey = Object.keys(data).filter((k) =>
            k.match(/zeroindex__/)
          )[0]
          data.zero_key = zkey.replace('zeroindex__', '')
          data.zero_val = data[zkey]
          // console.log(
          //   'have zero_key:',
          //   data.zero_key,
          //   ' have data.zero_val:',
          //   data.zero_val
          // )
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
