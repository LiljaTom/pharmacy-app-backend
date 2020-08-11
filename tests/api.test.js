const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const app = require('../app')
const api = supertest(app)

const Product = require('../models/product')
const User = require('../models/user')
const Order = require('../models/order')


//done
describe('Initial product situation', () => {
  let headers
  beforeEach(async() => {
    await Product.deleteMany({})
    await User.deleteMany({})
    const productObjects = helper.initialProducts
      .map(p => new Product(p))
    const promiseArray = productObjects.map(p => p.save())
    await Promise.all(promiseArray)

    const admin = helper.getAdmin()
    await api.post('/api/users').send(admin)
    const result = await api.post('/api/login').send(admin)
    headers = { 'Authorization': `bearer ${result.body.token}` }
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

  test('Admin can edit product', async() => {
    const [products] = await helper.productsInDB()
    const editedProduct = { ...products, size: products.size + 5 }

    await api
      .put(`/api/products/${products.id}`)
      .send(editedProduct)
      .set(headers)
      .expect(200)

    const productsAtEnd = await helper.productsInDB()
    const edited = productsAtEnd.find(p => p.name === products.name)
    expect(edited.size).toBe(products.size + 5)

  })

  test('Unauthorized user cannot edit product', async() => {
    const [products] = await helper.productsInDB()
    const editedProduct = { ...products, size: products.size + 5 }

    await api
      .put(`/api/products/${products.id}`)
      .send(editedProduct)
      .expect(401)
  })
})

//Added admin stuff
describe('Addition of products', () => {
  let headers
  beforeEach(async() => {
    await Product.deleteMany({})
    await User.deleteMany({})

    const productObjects = helper.initialProducts
      .map(p => new Product(p))
    const promiseArray = productObjects.map(p => p.save())
    await Promise.all(promiseArray)

    const admin = helper.getAdmin()
    await api.post('/api/users').send(admin)
    const result = await api.post('/api/login').send(admin)

    headers = { 'Authorization': `bearer ${result.body.token}` }
  })

  test('Admin can add valid product', async() => {
    const newProduct = {
      name: 'ValidProduct',
      size: 20,
      price: 7.90,
      prescription: true
    }

    await api
      .post('/api/products')
      .send(newProduct)
      .set(headers)
      .expect(201)
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

    await api.post('/api/products').send(newProduct).set(headers).expect(400)

    const productsAtEnd = await helper.productsInDB()
    expect(productsAtEnd).toHaveLength(helper.initialProducts.length)
  })

  test('Unauthorized user cannot add valid product', async() => {
    const newProduct = {
      name: 'ValidProduct',
      size: 20,
      price: 7.90,
      prescription: true
    }
    await api.post('/api/products').send(newProduct).expect(401)
  })
})

//done
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

//done
describe('Deletion of product', () => {
  let headers
  beforeEach(async() => {
    await User.deleteMany({})
    const admin = helper.getAdmin()

    await api.post('/api/users').send(admin)
    const result = await api.post('/api/login').send(admin)

    headers = { 'Authorization': `bearer ${result.body.token}` }
  })

  test('Is succesfull if id is valid and return status 204', async() => {
    const productsAtStart = await helper.productsInDB()
    const productToDelete = productsAtStart[0]

    await api
      .delete(`/api/products/${productToDelete.id}`)
      .set(headers)
      .expect(204)

    const productsAtEnd = await helper.productsInDB()

    const contents = productsAtEnd.map(p => p.name)

    expect(contents).not.toContain(productToDelete.name)
    expect(productsAtEnd).toHaveLength(helper.initialProducts.length - 1)
  })

  test('Unauthorized user cannot delete product', async() => {
    const productsAtStart = await helper.productsInDB()
    const productToDelete = productsAtStart[0]

    await api
      .delete(`/api/products/${productToDelete.id}`)
      .expect(401)
  } )
})

//done
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

describe('Initial order situation', () => {
  beforeEach(async() => {
    await Order.deleteMany({})
    await User.deleteMany({})
    await Product.deleteMany({})

    const productList = []

    let product = new Product(helper.initialProducts[0])
    await product.save()

    productList.push(product._id)
    product = new Product(helper.initialProducts[1])
    await product.save()
    productList.push(product._id)

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'tester', passwordHash })
    await user.save()


    const order = new Order({
      date: new Date(),
      delivered: false,
      user: user._id,
      products: productList
    })
    await order.save()
  })

  test('orders are returned as json', async() => {
    await api
      .get('/api/orders')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns all orders', async() => {
    const response = await api.get('/api/orders')
    expect(response.body).toHaveLength(1)
  })

  test('order can be edited', async() => {
    const [orders] = await helper.ordersInDB()
    const editedOrder = { ...orders, delivered: true }

    await api
      .put(`/api/orders/${orders.id}`)
      .send(editedOrder)
      .expect(200)

    const ordersAtEnd = await helper.ordersInDB()
    const edited = ordersAtEnd.find(o => o.id === orders.id)
    expect(edited.delivered).toBe(true)
  })

  test('Can delete order', async() => {
    const ordersAtStart = await helper.ordersInDB()
    const orderToDelete = ordersAtStart[0]

    await api.delete(`/api/orders/${orderToDelete.id}`).expect(204)

    const ordersAtEnd = await helper.ordersInDB()

    expect(ordersAtEnd).toHaveLength(ordersAtStart.length - 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})