const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
        postedBy: User
        votes: [Vote]!
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
        votes: [Vote]!
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
        allLinks(filter: LinkFilter): [Link!]!,
        allVotes: [Vote]!
    }

    input LinkFilter {
        OR: [LinkFilter!]
        description_contains: String
        url_contains: String
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
        createVote(linkId: ID!): Vote
        # using AuthProviderSignupData to emulate Graphcool
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayLoad!
    }

    type Subscription {
        Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
    }

    input LinkSubscriptionFilter {
        mutation_in: [_ModelMutationType!]
    }

    type LinkSubscriptionPayload {
        mutation: _ModelMutationType!
        node: Link
    }

    enum _ModelMutationType {
        CREATED
        UPDATED
        DELETED
    }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
