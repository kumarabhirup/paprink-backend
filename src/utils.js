require('es6-promise').polyfill()
require('isomorphic-fetch')

function validateEmail(mail) {
  if (/\b[a-zA-Z0-9\u00C0-\u017F._%+-]+@[a-zA-Z0-9\u00C0-\u017F.-]+\.[a-zA-Z]{2,}\b/.test(mail)) {
      return (true)
  } return (false)
}

async function isTokenValid(method, accessToken) {

  // Validate FB token
  if(method === "facebook") {
    const isTokenValid = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`)
    .then(res => (res.json()))
    .then(json => (json.data.is_valid))
    .catch(err => { throw new Error(`Error in Facebook API. ${err.message}`) })
    return isTokenValid
  }

  // Validate Google token
  if(method === "google") {
    const isTokenValid = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
    .then(res => (res.json()))
    .then(json => {
      if(json.email){
        if(json.azp === process.env.GOOGLE_LOGIN_APP_ID){
          return true
        } return false
      } return false
    })
    .catch(err => { throw new Error(`Error in Google API. ${err.message}`) })
    return isTokenValid
  }

}

module.exports = {
  validateEmail,
  isTokenValid
}
