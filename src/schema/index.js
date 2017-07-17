const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
    }

    type User {
        id: ID!
        name: String!
        email: String
    }

    input AuthProviderSignupData {
        email: AUTH_PROVIDER_EMAIL
    }

    input AUTH_PROVIDER_EMAIL {
        email: String!
        password: String!
    }

    type Query {
        allLinks: [Link!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link

        # using AuthProviderSignupData to emulate Graphcool
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
    }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
