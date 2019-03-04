require('dotenv').config()

const { GraphQLServer } = require('graphql-yoga')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const { prisma } = require('./generated/prisma-client')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')

// start it
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: {
    Query,
    Mutation
  },
  context: request => ({
    ...request,
    prisma,
  }),
})


// Error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { status } = err;
  res.status(status).json(err);
}; server.use(errorHandler);

// COOKIE PARSER
server.express.use(cookieParser())

// Decode the JWT
server.express.use((req, res, next) => {
    const { paprinkToken } = req.cookies
    if(paprinkToken){
        const { userId } = jwt.verify(paprinkToken, process.env.JWT_SECRET)
        req.userId = userId
    }
    next()
})

// Populate the user
server.express.use(async (req, res, next) => {

    // skip if they aren't logged in
    if(!req.userId){
        return next()
    }

    const user = await prisma.user({ id: req.userId }, '{ id, fname, lname, name, email, previledge }')
    req.user = user

    next()

})


server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.NODE_ENV === 'development' ? process.env.FRONTEND_URL : process.env.PROD_FRONTEND_URL
    },
    endpoint: '/graphql',
    playground: process.env.NODE_ENV === 'development' ? '*' : false
  },
  details => console.log(`Server is running on http://localhost:${details.port}`)
)
