require('es6-promise').polyfill()
require('isomorphic-fetch')

const { validateEmail } = require('../utils')

async function singUp(parent, args, context){
  throw new Error('you cannot signup!')
}

module.exports = {
  sendMessage
}
