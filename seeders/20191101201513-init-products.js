'use strict'

const csv = require('csv-parser')
const fs = require('fs')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});

      UNF,UPC Code,Long Name,Advertising Description,PK,Size,Unit Type,M,W/S Price,U Price,Category Description,a,r,c,l,d,f,g,v,w,y,k,ft,m,og,s,n

    */

    return new Promise(function(resolve, reject) {
      const results = []
      let cat = ''
      fs.createReadStream('unfi_edit.csv')
        .pipe(
          csv({
            mapHeaders: ({ header, index }) => {
              switch (header) {
                case 'UPC Code':
                  return 'upc_code'
                case 'Long Name':
                  return 'long_name'
                case 'Advertising Description':
                  return 'description'
                case 'Unit Type':
                  return 'unit_type'
                case 'M':
                  // remove this column
                  return null
                case 'W/S Price':
                  return 'ws_price'
                case 'U Price':
                  return 'u_price'
                case 'Category Description':
                  return 'sub_category'
                default:
                  return header.toLowerCase()
              }
            },
            mapValues: ({ header, index, value }) => value.trim()
          })
        )
        .on('data', data => {
          if (
            data['upc_code'] === '' &&
            data['long_name'] === '' &&
            data['unf']
          ) {
            cat = data['unf']
          } else {
            data['category'] = cat

            // aggregate codes cols into single col
            let codes = []
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
            CODE_COLZ.forEach(code => {
              if (data[code]) {
                codes.push(data[code])
              }
              delete data[code]
            })
            data['codes'] = codes.join(', ')

            data['ws_price'] = data['ws_price'].replace('$', '')
            data['u_price'] = data['u_price'].replace('$', '')
            results.push(data)
          }
        })
        .on('end', () => {
          console.log('done reading csv, results.length:', results.length)

          queryInterface.bulkInsert('Products', results, {})
          resolve()
        })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
