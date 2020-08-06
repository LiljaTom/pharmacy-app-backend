const mongoose = require('mongoose')
const supertest = require('supertest')
const Product= require('../models/product')
const helper = require('./product_test_helper')

const app = require('../app')
const api = supertest(app)


describe('Initial situation', () => {
  beforeEach(async() => {
    await Product.deleteMany({})
    const productObjects = helper.initialProducts
      .map(p => new Product(p))
    const promiseArray = productObjects.map(p => p.save())
    await Promise.all(promiseArray)
  })

  test('products are returned as json', async() => {
    await api
      .get('/api/products')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns all products', async() => {
    const response = await api.get('/api/products')
    expect(response.body).toHaveLength(helper.initialProducts.length)
  })

  test('Product can be edited', async() => {
    const [products] = await helper.productsInDB()
    const editedProduct = { ...products, size: products.size + 5 }

    await api
      .put(`/api/products/${products.id}`)
      .send(editedProduct)
      .expect(200)

    const productsAtEnd = await helper.productsInDB()
    const edited = productsAtEnd.find(p => p.name === products.name)
    expect(edited.size).toBe(products.size + 5)

  })
})

describe('Addition of products', () => {
  beforeEach(async() => {
    await Product.deleteMany({})
    const productObjects = helper.initialProducts
      .map(p => new Product(p))
    const promiseArray = productObjects.map(p => p.save())
    await Promise.all(promiseArray)
  })

  test('Valid product can be added', async() => {
    const newProduct = {
      name: 'ValidProduct',
      size: 20,
      price: 7.90,
      prescription: true
    }

    await api
      .post('/api/products')
      .send(newProduct)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const products = await helper.productsInDB()
    const contents = products.map(p => p.name)

    expect(products).toHaveLength(helper.initialProducts.length + 1)
    expect(contents).toContain('ValidProduct')
  })

  test('Invalid product cannot be added', async() => {
    const newProduct = {
      name: 'Invalid product'
    }

    await api.post('/api/products').send(newProduct).expect(400)

    const productsAtEnd = await helper.productsInDB()
    expect(productsAtEnd).toHaveLength(helper.initialProducts.length)
  })
})

describe('Viewing a certain product', () => {
  test('Is succesfull with valid id', async() => {
    const productsAtStart = await helper.productsInDB()
    const product = productsAtStart[0]

    const resultProduct = await api
      .get(`/api/products/${product.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultProduct.body).toEqual(product)

  })

  test('Fails if id is invalid and returns status 400', async() => {
    const invalidId = 'invalidid'

    await api
      .get(`/api/products/${invalidId}`)
      .expect(400)
  })

  test('Fails if product does not exist and returns status 404', async() => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/products/${validNonExistingId}`)
      .expect(404)
  })
})

describe('Deletion of product', () => {
  test('Is succesfull if id is valid and return status 204', async() => {
    const productsAtStart = await helper.productsInDB()
    const productToDelete = productsAtStart[0]

    await api
      .delete(`/api/products/${productToDelete.id}`)
      .expect(204)

    const productsAtEnd = await helper.productsInDB()

    const contents = productsAtEnd.map(p => p.name)

    expect(contents).not.toContain(productToDelete.name)
    expect(productsAtEnd).toHaveLength(helper.initialProducts.length - 1)
  })
})


afterAll(() => {
  mongoose.connection.close()
})