const productsRouter = require('express').Router()
const Product = require('../models/product')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

productsRouter.get('/', async(req, res) => {
  const products = await Product.find({})
  res.json(products.map(p => p.toJSON()))
})

productsRouter.get('/:id', async(req, res) => {
  const product = await Product.findById(req.params.id)
  if(product) {
    res.json(product.toJSON())
  } else {
    res.status(404).end()
  }
})

productsRouter.post('/', async(req, res) => {
  const body = req.body
  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  if(!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'Invalid or missing token' })
  }

  const user = await User.findById(decodedToken.id)

  if(user.username !== 'Admin') {
    return res.status(401).json({ error: 'Only admin can create product' })
  }

  const product = new Product({
    name: body.name,
    size: body.size,
    price: body.price,
    prescription: body.prescription,
    category: body.category
  })

  const savedProduct= await product.save()
  res.status(201).json(savedProduct)

})

productsRouter.delete('/:id', async(req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)


  if(!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'Invalid or missing token' })
  }

  const user = await User.findById(decodedToken.id)

  if(user.username !== 'Admin') {
    return res.status(401).json({ error: 'Only admin can delete products' })
  }

  const product = await Product.findById(req.params.id)
  await product.remove()
  res.status(204).end()
})

productsRouter.put('/:id', async(req, res) => {
  const product = req.body
  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  if(!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'Invalid or missing token' })
  }

  const user = await User.findById(decodedToken.id)

  if(user.username !== 'Admin') {
    return res.status(401).json({ error: 'Only admin can delete products' })
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, product, { new: true })
  res.json(updatedProduct.toJSON())
})



module.exports = productsRouter