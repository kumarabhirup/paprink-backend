async function users(parent, args, context, info) {
  throw new Error(`Sorry. But just go and fuck yourself!`)
}

async function me(parent, args, context){
  if(!context.request.userId){
      return null
  } return context.prisma.user({id: context.request.userId})
}

module.exports = {
  users,
  me
}
