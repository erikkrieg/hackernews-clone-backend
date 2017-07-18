const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
        postedBy: User
    }

    type Vote {
        id: ID!
        user: User!
        link: Link!
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

    type SigninPayLoad {
        token: String
        user: User
    }

    type Query {
        allLinks: [Link!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
        createVote(linkId: ID!): Vote
        # using AuthProviderSignupData to emulate Graphcool
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayLoad!
    }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
