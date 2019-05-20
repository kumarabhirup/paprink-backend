"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Previledge",
    embedded: false
  },
  {
    name: "Gender",
    embedded: false
  },
  {
    name: "CategoryEnum",
    embedded: false
  },
  {
    name: "Category",
    embedded: false
  },
  {
    name: "PostStatus",
    embedded: false
  },
  {
    name: "Post",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Upvote",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://prodpaprink-5f26e1e0b6.herokuapp.com/paprink-backend/prod`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
