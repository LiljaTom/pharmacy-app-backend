const productsRouter = require('express').Router()
const Product = require('../models/product')

productsRouter.get('/', (req, res) => {
  Product.find({}).then(products => {
    res.json(products.map(p => p.toJSON()))
  })
})

productsRouter.get('/:id', (req, res, next) => {
  Product.findById(req.params.id)
    .then(product => {
      if(product){
        res.json(product.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

productsRouter.post('/', (req, res, next) => {
  const body = req.body

  const product = new Product({
    name: body.name,
    size: body.size,
    price: body.price,
    prescription: body.prescription
  })

  product.save()
    .then(savedProduct => {
      res.json(savedProduct.toJSON())
    })
    .catch(error => next(error))
})

productsRouter.delete('/:id', (req, res, next) => {
  Product.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

productsRouter.put('/:id', (req, res, next) => {
  const body = req.body

  const product = {
    name: body.name,
    size: body.size,
    price: body.price,
    prescription: body.prescription
  }

  Product.findByIdAndUpdate(req.params.id, product, { new: true })
    .then(updatedProduct => {
      res.json(updatedProduct.toJSON())
    })
    .catch(error => next(error))
})



module.exports = productsRouter