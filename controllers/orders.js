const ordersRouter = require('express').Router()
const Order = require('../models/order')
const User = require('../models/user')

ordersRouter.get('/', async(req, res) => {
  const orders = await Order.find({})
  res.json(orders.map(o => o.toJSON()))
})

ordersRouter.put('/:id', async(req, res) => {
  const order = req.body

  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, order, { new: true })
  res.json(updatedOrder.toJSON())
})

ordersRouter.delete('/:id', async(req, res) => {
  const order = await Order.findById(req.params.id)
  await order.remove()
  res.status(204).end()
})

ordersRouter.get('/:id', async(req, res) => {
  const order = await Order.findById(req.params.findById)
  if(order) {
    res.json(order.toJSON())
  } else {
    res.status(404).end()
  }
})

ordersRouter.post('/', async(req, res) => {
  const body = req.params.body

  const user = await User.findById(body.userID)

  const order = new Order({
    delivered: false,
    date: new Date(),
    products: body.products,
    user: user._id
  })

  const savedOrder = await order.save()
  res.status(201).json(savedOrder)
})


module.exports = ordersRouter