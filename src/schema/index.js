const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
    }
`

module.exports = makeExecutableSchema(typeDefs)
