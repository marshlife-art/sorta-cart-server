const Op = require('sequelize').Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const findParamsFor = (query) => {
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
    query.filters.forEach((filter) => {
      if (
        filter.column &&
        filter.column.field &&
        filter.value &&
        filter.value.length
      ) {
        let filters = undefined
        if (filter.column.field === 'codes') {
          filters = {
            codes: {
              [Op.or]: filter.value.map((val) => ({ [iLike]: `%${val}%` }))
            }
          }
        } else if (filter.column.field === 'description') {
          filters = {
            description: {
              [Op.or]: { [iLike]: `%${filter.value}%` }
            }
          }
        } else if (filter.column.field === 'import_tag') {
          filters = {
            import_tag: {
              [Op.or]: { [iLike]: `%${filter.value}%` }
            }
          }
        } else if (filter.column.field === 'count_on_hand') {
          if (filter.value === 'checked') {
            filters = {
              count_on_hand: {
                [Op.and]: { [Op.gt]: 0 }
              }
            }
          }
        } else if (Array.isArray(filter.value)) {
          filters = {
            [filter.column.field]: { [Op.or]: filter.value }
          }
        } else if (filter.column.type === 'boolean') {
          filters = {
            [filter.column.field]: filter.value === 'checked' ? true : false
          }
        } else {
          filters = {
            [filter.column.field]: filter.value
          }
        }

        if (
          filters &&
          findParams.where[Op.and] &&
          findParams.where[Op.and].length
        ) {
          findParams.where[Op.and].push(filters)
        } else if (filters) {
          findParams.where[Op.and] = [filters]
        }
      }
    })
  }

  return findParams
}

module.exports = findParamsFor
