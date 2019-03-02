const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils')

async function signIn(parent, args, context){

  /**
   * 
   * FB verification
   * graph.facebook.com/debug_token?
   * input_token={token-to-inspect}
   * &access_token={app_id}|{app_secret}

   * Google verification
   * https://oauth2.googleapis.com/tokeninfo?access_token=
   * 
   */

  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  return true

}

module.exports = {
  signIn
}
