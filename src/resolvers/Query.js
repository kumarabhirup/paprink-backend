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
  const hasSlashAtLast = arrayOfUnfilteredPostId[arrayOfUnfilteredPostId.length - 1] === "/" || arrayOfUnfilteredPostId[arrayOfUnfilteredPostId.length - 1] === "#"

  const postId = hasSlashAtLast ? unfilteredPostId.slice(0, -1) : unfilteredPostId // is '252352532 (without slash)'

  const post = await context.db.query.post({where: {id: postId}}, postInfo)

  if (post.status === "PUBLISHED") {
    return post
  } else if (post.status === "DRAFT" && post.author.id === context.request.userId ) {
    return post
  } else {
    throw new Error('POST NOT FOUND!')
  }

}

async function postsCategoryConnection(parent, args, context, info) {
  
  const category = args.categorySlug

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED", 
      categories_some: {
        category
      }
    },
    first: 8,
    orderBy: args.orderBy || "upvotesNumber_DESC",
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error('Error finding the posts.')

}

async function postsAuthorConnection(parent, args, context, info) {
  
  const authorUsername = args.authorUsername

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED", 
      author: {
        username: authorUsername
      }
    },
    first: 8,
    orderBy: args.orderBy || "upvotesNumber_DESC",
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error('Error finding the author.')

}

async function getAuthor(parent, args, context, info) {

  const authorUsername = args.authorUsername

  const author = await context.db.query.user({
    where: {
      username: authorUsername
    }
  }, info)

  if (author) {
    return author
  }

  throw new Error('Author not found.')

}

async function search(parent, args, context, info) {

  const posts = await context.db.query.posts({
    where: {
      status: "PUBLISHED",
      OR: [
        {
          title_contains: args.searchString
        },
        {
          author: {
            username: args.searchString
          }
        },
        {
          categories_some: {
            text_contains: args.searchString
          }
        }
      ]
    }
  }, info)

  return posts

}

async function getToday(parent, args, context, info) {

  const date = new Date()
  const todayDateISO = date.toISOString().slice(0, 10) // To get format like "2018-08-03" [ ISO 8601 format is UTC ]
  const tomorrow = new Date(date); tomorrow.setDate(date.getDate() + 1);
  const tomorrowDateISO = tomorrow.toISOString().slice(0, 10)

  // console.log('Today: ' + todayDateISO)
  // console.log('Tomorrow: ' + tomorrowDateISO)

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED",
      createdAt_gte: todayDateISO,
      NOT: [{
        createdAt_gte: tomorrowDateISO
      }]
    },
    orderBy: args.orderBy || "upvotesNumber_DESC",
    first: 6,
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error(`Error getting today's posts.`)

}

async function getYesterday(parent, args, context, info) {

  const date = new Date()
  const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
  const yesterdayDateISO = yesterday.toISOString().slice(0, 10)
  const todayDateISO = date.toISOString().slice(0, 10) // To get format like "2018-08-03" [ ISO 8601 format is UTC ]

  // console.log('Yesterday: ' + tomorrowDateISO)
  // console.log('Today: ' + todayDateISO)

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED",
      createdAt_gte: yesterdayDateISO,
      NOT: [{
        createdAt_gte: todayDateISO
      }]
    },
    orderBy: args.orderBy || "upvotesNumber_DESC",
    first: 6,
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error(`Error getting yesterday's posts.`)

}

async function getWeekly(parent, args, context, info) {

  const date = new Date()
  const weekAgo = new Date(date); weekAgo.setDate(date.getDate() - 7);
  const weekAgoDateISO = weekAgo.toISOString().slice(0, 10)
  const todayDateISO = date.toISOString().slice(0, 10) // To get format like "2018-08-03" [ ISO 8601 format is UTC ]

  // console.log('Week Ago: ' + weekAgoDateISO)
  // console.log('Today: ' + todayDateISO)

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED",
      createdAt_gte: weekAgoDateISO,
      // TODO: Filter posts by minimum number of upvotes needed
    },
    orderBy: args.orderBy || "upvotesNumber_DESC",
    first: 3,
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error(`Error getting weekly top posts.`)

}

async function getLatest(parent, args, context, info) {

    const connection = await context.db.query.postsConnection({
      where: {
        status: "PUBLISHED"
      },
      orderBy: "createdAt_DESC",
      first: 8,
      after: args.after
    }, info)

  if (connection) {
    return connection
  }

  throw new Error(`Error getting latest posts!`)

}

async function getFeatured(parent, args, context, info) {

  const posts = await context.db.query.posts({
    where: {
      status: "PUBLISHED"
    },
    orderBy: "upvotesNumber_DESC",
    first: 4
  }, info)

  if (posts) {
    return posts
  }

  throw new Error(`Error getting featured posts!`)

}

async function upvotedPostsAuthorConnection(parent, args, context, info) {
  
  const authorUsername = args.authorUsername

  const connection = await context.db.query.postsConnection({
    where: {
      status: "PUBLISHED", 
      upvotes_some: {
        user: {
          username: authorUsername
        }
      }
    },
    first: 8,
    orderBy: args.orderBy || "createdAt_DESC",
    after: args.after
  }, info)

  if (connection) {
    return connection
  }

  throw new Error('Error finding the author.')

}

module.exports = {
  users,
  me,
  canUpdatePost,
  getPost,
  postsCategoryConnection,
  postsAuthorConnection,
  getAuthor,
  search,
  getToday,
  getYesterday,
  getWeekly,
  getLatest,
  getFeatured,
  upvotedPostsAuthorConnection
}