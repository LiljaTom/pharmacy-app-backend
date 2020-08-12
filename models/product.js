const mongoose= require('mongoose')

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  size: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  prescription: {
    type: Boolean,
    required: true
  },
  category: {
    type: String,
    required: true
  }
})

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Product', productSchema)