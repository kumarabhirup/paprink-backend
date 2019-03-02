const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils')

async function signIn(parent, args, context){

  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  throw new Error("SUCCESS")

}

module.exports = {
  signIn
}
