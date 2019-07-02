require('es6-promise').polyfill()
require('isomorphic-fetch')

function validateEmail(mail) {
  if (/\b[a-zA-Z0-9\u00C0-\u017F._%+-]+@[a-zA-Z0-9\u00C0-\u017F.-]+\.[a-zA-Z]{2,}\b/.test(mail)) {
      return (true)
  } return (false)
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateToken(length, options = {}){
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("")
    if (options.lower) {
      var a = "abcdefghijklmnopqrstuvwxyz1234567890".split("")
    }
    var b = []
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0)
        b[i] = a[j]
    }
    return b.join("")
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

const postInfo = `{ id title slug authorId upvotesNumber refUrl categories { id text category } thumbnail editorCurrentContent editorHtml editorSerializedOutput author { id name email fname lname profilePicture username previledge } upvotes { id user { id } } createdAt updatedAt publishedAt status }`

module.exports = {
  validateEmail,
  isTokenValid,
  postInfo,
  generateToken,
  getRandomInt
}
