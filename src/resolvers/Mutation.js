require('es6-promise').polyfill()
require('isomorphic-fetch')

const { validateEmail } = require('../utils')

async function signUp(parent, args, context){
  throw new Error('you cannot signup!')
}

module.exports = {
  sendMessage
}
