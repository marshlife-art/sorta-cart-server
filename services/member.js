const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const Member = models.Member
const User = models.User
const Order = models.Order
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const createMember = async member => {
  if (!member) {
    return
  }
  delete member.id
  return await Member.create({
    ...member,
    phone: member.phone.match(/[0-9]+/g).join('')
  })
}

const upsertMember = async member => {
  if (!member) {
    return
  }
  return await Member.upsert(member)
}

const getMember = async member => {
  return await Member.findOne({
    where: member,
    include: [User]
  })
}

const getMembers = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    findParams.where[Op.or] = [
      { name: { [iLike]: `%${q}%` } },
      { registration_email: { [iLike]: `%${q}%` } },
      { phone: { [iLike]: `%${q}%` } },
      { address: { [iLike]: `%${q}%` } }
    ]
  }

  findParams.include = [User]
  return await Member.findAndCountAll(findParams)
}

const destroyMember = async id => {
  const member = await Member.findOne({ where: { id } })
  const userId = member.UserId
  return Order.update({ MemberId: null }, { where: { MemberId: member.id } })
    .then(() => Order.update({ UserId: null }, { where: { UserId: userId } }))
    .then(() => member.destroy())
    .then(() => User.destroy({ where: { id: userId } }))
}

module.exports = {
  createMember,
  upsertMember,
  getMember,
  getMembers,
  destroyMember
}
