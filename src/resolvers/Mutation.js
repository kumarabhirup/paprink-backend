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
    const newUser = await context.prisma.createUser({...data})

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET)
    context.response.cookie('paprinkToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return newUser

  }

  const token = jwt.sign({ userId: signedUser.id }, process.env.JWT_SECRET)
  await context.response.cookie('paprinkToken', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
  })

  return signedUser

}

async function signOut(parent, args, context){
  await context.response.clearCookie('paprinkToken')
  return { code: 10, message: 'Signed out successfully.' }
}

module.exports = {
  signIn,
  signOut
}
