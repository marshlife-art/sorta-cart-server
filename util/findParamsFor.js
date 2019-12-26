const Op = require('sequelize').Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const findParamsFor = query => {
  // console.log('findParamsFor query:', query)
  const limit = query.pageSize || 50
  const page = query.page || 0
  const orderBy = (query.orderBy && query.orderBy.field) || 'id'
  const orderDirection = query.orderDirection || 'DESC'

  let findParams = {
    offset: page * limit,
    limit: limit,
    where: {}
  }
  if (orderBy) {
    findParams.order = [[orderBy, orderDirection]]
  }

  if (query.filters && query.filters.length) {
    // map all filters into a buncha WHEREz
    // ...this is pretty gnarly ¯\_(ツ)_/¯
    query.filters.forEach(filter => {
      if (
        filter.column &&
        filter.column.field &&
        filter.value &&
        filter.value.length
      ) {
        if (filter.column.field === 'codes') {
          let codeFilters = filter.value.map(val => ({
            codes: { [iLike]: `%${val}%` }
          }))
          if (findParams.where[Op.or] && findParams.where[Op.or].length) {
            findParams.where[Op.or].push(codeFilters)
          } else {
            findParams.where[Op.or] = codeFilters
          }
        } else if (
          filter.column.field === 'category' ||
          filter.column.field === 'sub_category'
        ) {
          let catFilters = filter.value.map(val => ({
            [filter.column.field]: val
          }))
          if (findParams.where[Op.or] && findParams.where[Op.or].length) {
            findParams.where[Op.or].push(catFilters)
          } else {
            findParams.where[Op.or] = catFilters
          }
        } else if (Array.isArray(filter.value)) {
          let filters = filter.value.map(val => ({
            [filter.column.field]: val
          }))
          // if (findParams.where[Op.and] && findParams.where[Op.and].length) {
          //   findParams.where[Op.and].push(filters)
          // } else {findParams.where[Op.and] = filters}
          findParams.where[Op.and] = filters
        } else {
          findParams.where[filter.column.field] = filter.value
        }
      }
    })
  }

  // console.log(
  //   'findParamsFor gonna return findParams:',
  //   JSON.stringify(findParams)
  // )
  return findParams
}

module.exports = findParamsFor
