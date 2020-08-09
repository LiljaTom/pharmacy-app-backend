const productsRouter = require('express').Router()
const Product = require('../models/product')

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

  const product = new Product({
    name: body.name,
    size: body.size,
    price: body.price,
    prescription: body.prescription
  })

  const savedProduct= await product.save()
  res.status(201).json(savedProduct)

})

productsRouter.delete('/:id', async(req, res) => {
  const product = await Product.findById(req.params.id)
  await product.remove()
  res.status(204).end()
})

productsRouter.put('/:id', async(req, res) => {
  const product = req.body

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, product, { new: true })
  res.json(updatedProduct.toJSON())
})



module.exports = productsRouter