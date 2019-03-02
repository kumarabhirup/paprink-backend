const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils')

async function signIn(parent, args, context){

  const data = { ...args }
  delete data.accessToken

  // Verify token
  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  // Check if user is already signedUp!
  const signedUser = await context.prisma.user({socialId: args.socialId})
  if(!signedUser) {

    // Create user
    const user = await context.prisma.createUser({...data})

    // TODO: Save cookies

    return user

  }

  // TODO: Save cookies
  throw new Error('YOU ARE SIGNED IN.')

}

module.exports = {
  signIn
}
