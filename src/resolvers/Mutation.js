const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils')

async function signIn(parent, args, context){

  const data = { ...args }
  delete data.accessToken

  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  const user = await context.prisma.createUser({...data})
  return user

}

module.exports = {
  signIn
}
