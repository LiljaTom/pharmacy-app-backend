const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const app = require('../app')
const api = supertest(app)

const Product = require('../models/product')
const User = require('../models/user')



describe('Initial product situation', () => {
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

describe('Initial user situation', () => {
  beforeEach(async() => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'tester', passwordHash })

    await user.save()
  })

  test('can create user with unique username', async() => {
    const usersAtStart = await helper.usersInDB()

    const user = {
      username: 'newUser',
      name: 'User',
      password: 'solidPassword'
    }
    await api
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    const usernames = usersAtEnd.map(u => u.username)

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    expect(usernames).toContain(user.username)
  })

  test('Creation fails with non unique username and returns valid status and message', async() => {
    const usersAtStart = await helper.usersInDB()

    const invalidUser = {
      username: 'tester',
      name: 'Invalid',
      password: 'password'
    }

    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    const names = usersAtEnd.map(u => u.username)

    expect(result.body.error).toContain('`username` to be unique')
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(names).not.toContain(invalidUser.name)
  })



})


afterAll(() => {
  mongoose.connection.close()
})