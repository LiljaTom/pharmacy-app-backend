const express = require('express')
const app = express()

app.use(express.json())

let products = [
    {
        id: 1,
        name: 'Lääke1',
        size: 60,
        prize: 5.60,
        prescription: true
    },
    {
        id: 2,
        name: 'lääke2',
        size: 30,
        prize: 4.98,
        prescription: false
    }
]

app.get('/api/products', (_req, res) => {
    res.json(products)
})

app.get('/api/products/:id', (req, res) => {
    const id = Number(req.params.id)
    const product = products.find(p => p.id === id)

    if(product) {
        res.json(product)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/products/:id', (req, res) => {
    const id = Number(req.params.id)
    products = products.filter(p => p.id !== id)

    res.status(204).end()
})

const generateId = () => {
    const maxId = products.length > 0
        ? Math.max(...products.map(p => p.id))
        : 0
    return maxId + 1
}

app.post('/api/products', (req, res) => {
    const body = req.body
    
    const product = {
        id: generateId(),
        name: body.name,
        size: body.size,
        prize: body.prize,
        prescription: body.prescription || false
    }
    products = products.concat(product)
    res.json(products)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})