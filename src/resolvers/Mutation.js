const jwt = require('jsonwebtoken')
const slugify = require('slug')
const { isTokenValid } = require('../utils')
const { postInfo } = require('../utils')

async function signIn(parent, args, context, info){

  const data = { ...args }

  // Verify token
  const isValid = await isTokenValid(args.signUpMethod, args.accessToken)
  if(!isValid) {
    throw new Error("Failed to recognize you!")
  }

  // Check if user is already signedUp!
  const signedUser = await context.db.query.user({where: {socialId: data.socialId}}, info)
  if(!signedUser) {

    // Create user
    const newUser = await context.db.mutation.createUser({
      data: {
        ...data,
        username: `${slugify(args.name, { lower: true, replacement: '_' })}_${Math.floor(Math.random() * 99) + 1}`
      }
    }, info)

    const token = jwt.sign({ userId: newUser.id, /*accessToken: args.accessToken,*/ signUpMethod: args.signUpMethod }, process.env.JWT_SECRET)
    context.response.cookie('paprinkToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    return newUser

  }

  // Update user with new access token
  await context.db.mutation.updateUser({
    data: {
      accessToken: data.accessToken,
      // fname: data.fname,
      // lname: data.lname,
      // name: data.name,
      // profilePicture: data.profilePicture,
      email: data.email, // TODO: Handle email match conflicts if email got changed
      gender: data.gender,
      birthday: data.birthday,
      // bio: data.bio
    },
    where: { id: signedUser.id }
  }, info)

  const token = jwt.sign({ userId: signedUser.id, /*accessToken: args.accessToken,*/ signUpMethod: args.signUpMethod }, process.env.JWT_SECRET)
  await context.response.cookie('paprinkToken', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
  })

  return signedUser

}

async function signOut(parent, args, context, info){

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

  const date = new Date().toISOString()

  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  const post = await context.db.mutation.createPost({
    data: {
      author: { connect: { id: context.request.userId } },
      authorId: context.request.userId,
      categories: {
        connect: args.categories.map(category => ({ category })),
      },
      status: args.status,
      publishedAt: args.status === "PUBLISHED" ? date : null,
      slug: slugify(args.title, { lower: true }),
      ...data
    }
  }, info)

  return post

}

async function updatePost(parent, args, context, info){

  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  const postToUpdate = await context.db.query.post({where: {id: args.id}}, postInfo)
  const canUpdate = postToUpdate.author.id === context.request.userId

  const date = new Date().toISOString()

  if (canUpdate) {

    // 1. First, disconnect the categories you had earlier
    await context.db.mutation.updatePost({
      where: { id: postToUpdate.id },
      data: {
        categories: {
          disconnect: JSON.parse(JSON.stringify(postToUpdate)).categories.map(category => {
            return { category: category.category }
          })
        }
      }
    }, `{ id }`)

    // 2. Fill the post with new categories!
    const post = await context.db.mutation.updatePost({
      where: { id: postToUpdate.id },
      data: {
        title: args.title,
        editorCurrentContent: args.editorCurrentContent,
        // editorHtml: args.editorHtml,
        editorSerializedOutput: args.editorSerializedOutput,
        categories: {
          connect: args.categories.map(category => ({ category })),
        },
        thumbnail: args.thumbnail,
        status: args.status,
        publishedAt: args.status === "PUBLISHED" ? date : null,
        slug: slugify(args.title, { lower: true }),
      }
    }, info)

    return post

  }

  throw new Error('You cannot update this post.')

}

/**
 * BUG! BUG! bug!!!! 🐛 🐞
 * Each upvote needs to be validated.
 * As per now, clicking upvote button a few times in a second, 
 * upvotes many times from a single account!
 */
async function upvote(parent, args, context, info){

  /**
   * @argument postId
   */

  // Check if user is signed in.
  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  // Check if already upvoted

  const loggedInUser = await context.db.query.user({
    where: { id: context.request.userId }
  }, 
  `
  {
    id
    upvotes {
      id
      post {
        id
      }
    }
  }
  `
  )
  
  const hasUpvotedPost = loggedInUser.upvotes.some(({post}) => post.id === args.postId)

  const postToUpvote = await context.db.query.post({ where: { id: args.postId } }, `{ id upvotes { id } }`)

  // UPVOTE!
  if (hasUpvotedPost === false) {

    const upvote = await context.db.mutation.createUpvote({
      data: {
        user: {
          connect: { id: context.request.userId }
        },
        post: {
          connect: { id: args.postId }
        }
      }
    }, `{
      id
      post {
        id
      }
      user {
        id
      }
    }`)

    const updateUpvotesNumber = await context.db.mutation.updatePost({
      where: {
        id: postToUpvote.id
      },
      data: {
        upvotesNumber: postToUpvote.upvotes.length + 1
      }
    }, `{
      id
      upvotesNumber
    }`)

    if ( !upvote ) {
      throw new Error("Your upvote failed. Try again later.")
    }

    return upvote

  }

  // DOWNVOTE!
  const upvoteId = loggedInUser.upvotes.filter(({post}) => post.id === args.postId)[0].id

  const downvote = await context.db.mutation.deleteUpvote({
    where: { id: upvoteId }
  }, `{ id }`)

  const updateUpvotesNumber = await context.db.mutation.updatePost({
    where: {
      id: postToUpvote.id
    },
    data: {
      upvotesNumber: postToUpvote.upvotes.length - 1
    }
  }, `{
    id
    upvotesNumber
  }`)

  if ( !downvote ) {
    throw new Error("Your downvote failed. Try again later.")
  }

  return downvote

}

async function updateUser(parent, args, context, info){

  if (!context.request.userId) {
    throw new Error('Please SignIn to continue.')
  }

  const signedInUser = await context.db.query.user({where: {id: context.request.userId}}, `{ id username }`)

  // Check if the username given already exists
  if (signedInUser.username !== args.username) {
    const userWithUsername = await context.db.query.user({where: {username: args.username}}, `{ id username }`)
    if (userWithUsername) {
      throw new Error(`The username ${args.username} is already taken!`)
    }
  }

  const updateUser = await context.db.mutation.updateUser({
    where: { id: context.request.userId },
    data: {
      ...args
    }
  }, info)

  if (!updateUser) {
    throw new Error('Sorry, failed to update your information!')
  }

  return updateUser

}

async function deletePost(parent, args, context, info){

  if(!context.request.userId){
    throw new Error('Please SignIn to continue.')
  }

  const postToDelete = await context.db.query.post({where: {id: args.id}}, postInfo)

  const canDelete = postToDelete.author.id === context.request.userId

  if (canDelete) {
    
    const deletePost = await context.db.mutation.deletePost({
      where: { id: postToDelete.id }
    }, info)

    return deletePost

  }

  throw new Error('You are not allowed to delete this post.')
  
}

module.exports = {
  signIn,
  signOut,
  savePost,
  updatePost,
  upvote,
  updateUser,
  deletePost
}
