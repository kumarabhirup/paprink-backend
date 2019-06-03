require('dotenv').config()

const { GraphQLServer } = require('graphql-yoga')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const db = require('./db')

var whitelist = [
  process.env.NODE_ENV === 'development'
          ? process.env.FRONTEND_URL
          : process.env.PROD_FRONTEND_URL, 
  process.env.WWW_PROD_FRONTEND_URL
]

const corsMW = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// start it
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: {
    Query,
    Mutation,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  context: request => {
    return {
      ...request,
      db,
    }
  },
})

// COOKIE PARSER
server.express.use(cookieParser())

server.express.use(cors(corsMW))
server.express.options('*', cors(corsMW))

// Decode the JWT
server.express.use((req, res, next) => {
  const { paprinkToken } = req.cookies
  if (paprinkToken) {
    const { userId } = jwt.verify(paprinkToken, process.env.JWT_SECRET)
    if (userId) {
      req.userId = userId
    }
  }
  next()
})

// Populate the user
server.express.use(async (req, res, next) => {
  // skip if they aren't logged in
  if (!req.userId) {
    return next()
  }

  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, fname, lname, name, email, previledge }',
  )
  req.user = user

  next()
})

server.start(
  {
    cors: corsMW,
    endpoint: '/api/graphql'
  },
  details => console.log(`Server is running on PORT ${details.port}`),
)