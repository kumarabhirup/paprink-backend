const { forwardTo } = require('prisma-binding')

async function users(parent, args, context, info) {
  throw new Error(`Sorry. But just go and fuck yourself!`)
}

async function me(parent, args, context){
  if(!context.request.userId){
    return null
  } return context.prisma.user({id: context.request.userId})
}

async function canUpdatePost(parent, args, context){

  if(!context.request.userId){
    throw new Error('Please SignIn to continue.')
  }

  const postToUpdate = await context.prisma.post({id: args.id})

  const canUpdate = postToUpdate.authorId === context.request.userId

  const getPostAuthor = await context.prisma.user({ id: postToUpdate.authorId })
  delete getPostAuthor.accessToken
  delete getPostAuthor.socialId
  delete getPostAuthor.updatedAt
  delete getPostAuthor.createdAt
  delete getPostAuthor.phone
  delete getPostAuthor.birthday
  delete getPostAuthor.bio

  if (canUpdate) {
    return {
      ...postToUpdate,
      author: {
        ...getPostAuthor
      }
    }
  }

  throw new Error('You are not allowed to update this post.')
  
}

async function getPost(parent, args, context){

  
  
}

module.exports = {
  users,
  me,
  canUpdatePost
}