const { forwardTo } = require('prisma-binding')
const { postInfo } = require('../utils')

async function users(parent, args, context, info) {
  throw new Error(`Sorry. But just go and fuck yourself!`)
}

async function me(parent, args, context, info){
  if(!context.request.userId){
    return null
  } return context.db.query.user({where: {id: context.request.userId}}, info)
}

async function canUpdatePost(parent, args, context, info){

  if(!context.request.userId){
    throw new Error('Please SignIn to continue.')
  }

  const postToUpdate = await context.db.query.post({where: {id: args.id}}, postInfo)

  const canUpdate = postToUpdate.author.id === context.request.userId

  if (canUpdate) {
    return postToUpdate
  }

  throw new Error('You are not allowed to update this post.')
  
}

async function getPost(parent, args, context, info){

  const { slugParam } = args
  const unfilteredPostId = slugParam.split('-').pop(-1) // " may be '252352532/' (with slash) "
  const arrayOfUnfilteredPostId = [...unfilteredPostId]
  const hasSlashAtLast = arrayOfUnfilteredPostId[arrayOfUnfilteredPostId.length - 1] === "/"

  const postId = hasSlashAtLast ? unfilteredPostId.slice(0, -1) : unfilteredPostId // is '252352532 (without slash)'

  const post = await context.db.query.post({where: {id: postId}}, postInfo)

  if (post) {
    return post
  }

  throw new Error('POST NOT FOUND.')

}

var postsConnection = (parent, args, context, info) => forwardTo("db")(parent, args, context, info)

module.exports = {
  users,
  me,
  canUpdatePost,
  getPost,
  postsConnection
}