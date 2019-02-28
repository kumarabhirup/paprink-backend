require('dotenv').config({ path: '.env' })

const { GraphQLServer } = require('graphql-yoga')
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
};
server.use(errorHandler);


server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.NODE_ENV === 'development' ? process.env.FRONTEND_URL : process.env.PROD_FRONTEND_URL
    },
    endpoint: '/graphql'
  },
  details => console.log(`Server is running on http://localhost:${details.port}`)
)
