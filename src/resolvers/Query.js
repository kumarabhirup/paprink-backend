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

  const canUpdate = postToUpdate.author.id === context.request.userId

  if (canUpdate) {
    return postToUpdate
  }

  throw new Error('You are not allowed to update this post.')
  
}

module.exports = {
  users,
  me,
  canUpdatePost
}
