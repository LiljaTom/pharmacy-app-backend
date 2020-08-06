const mongoose = require('mongoose')
const supertest = require('supertest')
const Product= require('../models/product')

const app = require('../app')
const api = supertest(app)

const testProducts = [
  {
    name: 'TestMedicine1',
    size: 60,
    price: 4.90,
    prescription: true
  },
  {
    name: 'TestMedicine2',
    size: 40,
    price: 8.90,
    prescription: false
  }
]

beforeEach(async() => {
  await Product.deleteMany({})

  let productObject = new Product(testProducts[0])
  await productObject.save()

  productObject = new Product(testProducts[1])
  await productObject.save()
})



test('products are returned as json', async() => {
  await api
    .get('/api/products')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('returns all products', async() => {
  const response = await api.get('/api/products')
  expect(response.body).toHaveLength(testProducts.length)
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

  const response = await api.get('/api/products')
  const contents = response.body.map(p => p.name)

  expect(response.body).toHaveLength(testProducts.length + 1)
  expect(contents).toContain('ValidProduct')
})

test('Invalid product cannot be added', async() => {
  const newProduct = {
    name: 'Invalid product'
  }

  await api.post('/api/products').send(newProduct).expect(400)

  const response = await api.get('/api/products')
  expect(response.body).toHaveLength(testProducts.length)
})

afterAll(() => {
  mongoose.connection.close()
})