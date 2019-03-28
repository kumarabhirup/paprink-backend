const { forwardTo } = require('prisma-binding')

async function users(parent, args, context, info) {
  throw new Error(`Sorry. But just go and fuck yourself!`)
}

async function me(parent, args, context, info){
  if(!context.request.userId){
    return null
  } return context.prisma.user({id: context.request.userId})
}

async function canUpdatePost(parent, args, context, info){

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

async function getPost(parent, args, context, info){

  const { slugParam } = args
  const unfilteredPostId = slugParam.split('-').pop(-1) // " may be '252352532/' (with slash) "
  const arrayOfUnfilteredPostId = [...unfilteredPostId]
  const hasSlashAtLast = arrayOfUnfilteredPostId[arrayOfUnfilteredPostId.length - 1] === "/"

  const postId = hasSlashAtLast ? unfilteredPostId.slice(0, -1) : unfilteredPostId // is '252352532 (without slash)'
  
  const post = await context.prisma.post({id: postId})
  const postAuthor = await context.prisma.user({ id: post.authorId })
  delete postAuthor.accessToken
  delete postAuthor.socialId
  delete postAuthor.updatedAt
  delete postAuthor.createdAt
  delete postAuthor.phone
  delete postAuthor.birthday
  delete postAuthor.bio

  if (post) {
    return {
      ...post,
      author: {
        ...postAuthor
      }
    }
  }

  throw new Error('POST NOT FOUND.')

}

var postsConnection = (parent, args, context, info) => forwardTo("prisma")(parent, args, context, info)

module.exports = {
  users,
  me,
  canUpdatePost,
  getPost,
  postsConnection
}