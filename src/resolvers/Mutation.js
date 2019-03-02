require('es6-promise').polyfill()
require('isomorphic-fetch')

const { validateEmail } = require('../utils')

async function signIn(parent, args, context){
  throw new Error('you cannot signin!')
}

module.exports = {
  signIn
}
