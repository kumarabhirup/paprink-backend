const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils')
const slugify = require('slug')

async function signIn(parent, args, context){

  const data = { ...args }

  // Verify token
  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  // Check if user is already signedUp!
  const signedUser = await context.prisma.user({socialId: data.socialId})
  if(!signedUser) {

    // Create user
    const newUser = await context.prisma.createUser({...data})

    const token = jwt.sign({ userId: newUser.id, /*accessToken: args.accessToken,*/ signUpMethod: args.signUpMethod }, process.env.JWT_SECRET)
    context.response.cookie('paprinkToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    return newUser

  }

  // Update user with new access token
  await context.prisma.updateUser({
    data: {
      accessToken: data.accessToken,
      fname: data.fname,
      lname: data.lname,
      name: data.name,
      profilePicture: data.profilePicture,
      email: data.email, // TODO: Handle email match conflicts if email got changed
      gender: data.gender,
      birthday: data.birthday,
      bio: data.bio
    },
    where: { id: signedUser.id }
  })

  const token = jwt.sign({ userId: signedUser.id, /*accessToken: args.accessToken,*/ signUpMethod: args.signUpMethod }, process.env.JWT_SECRET)
  await context.response.cookie('paprinkToken', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
  })

  return signedUser

}

async function signOut(parent, args, context){

  /**
   * Revoke Google Token: https://accounts.google.com/o/oauth2/revoke?token={access_token}
   * Revoke FB token: https://developers.facebook.com/docs/facebook-login/permissions/v2.0 [DELETE /{user-id}/permissions?access_token={access_token}]
   */

  await context.response.clearCookie('paprinkToken')
  return { code: 10, message: 'Signed out successfully.' }

}

async function savePost(parent, args, context, info){

  let data = {...args}
  delete data.categories
  delete data.status

  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  const post = await context.prisma.createPost({
    author: { connect: { id: context.request.userId } },
    authorId: context.request.userId,
    categories: {
      set: args.categories,
    },
    status: args.status,
    slug: slugify(args.title, { lower: true }),
    ...data
  })

  return post

}

async function updatePost(parent, args, context, info){

  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  const postToUpdate = await context.prisma.post({id: args.id})
  const canUpdate = postToUpdate.authorId === context.request.userId

  if (canUpdate) {

    const post = await context.prisma.updatePost({
      where: { id: postToUpdate.id },
      data: {
        title: args.title,
        editorCurrentContent: args.editorCurrentContent,
        editorHtml: args.editorHtml,
        editorSerializedOutput: args.editorSerializedOutput,
        categories: {
          set: args.categories
        },
        thumbnail: args.thumbnail,
        status: args.status,
        slug: slugify(args.title, { lower: true }),
      }
    })

    return post

  }

  throw new Error('You cannot Update this post.')

}

module.exports = {
  signIn,
  signOut,
  savePost,
  updatePost
}
