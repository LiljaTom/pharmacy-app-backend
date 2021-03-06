const Product = require('../models/product')
const User = require('../models/user')
const Order = require('../models/order')


const initialProducts = [
  {
    name: 'TestMedicine1',
    size: 60,
    price: 4.90,
    prescription: true,
    category: 'Vitamin'
  },
  {
    name: 'TestMedicine2',
    size: 40,
    price: 8.90,
    prescription: false,
    category: 'Lotion'
  }
]


const nonExistingId = async() => {
  const product = new Product({ name: 'removesoonproduct', size: 30, price: 3.80, prescription: true, category:'somethhing' })
  await product.save()
  await product.remove()

  return product._id.toString()
}

const productsInDB = async() => {
  const products = await Product.find({})
  return products.map(p => p.toJSON())
}

const usersInDB = async() => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const ordersInDB = async() => {
  const orders = await Order.find({})
  return orders.map(o => o.toJSON())
}

const getAdmin = () => {
  const admin = {
    username: 'Admin',
    name: 'TLilja',
    password: 'admin'
  }
  return admin
}

module.exports = {
  initialProducts, nonExistingId, productsInDB, usersInDB, ordersInDB, getAdmin
}