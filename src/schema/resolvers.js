const { ObjectID } = require('mongodb')
const { URL } = require('url')
const pubsub = require('../pubsub')

const assertValidLink = url => {
    try {
        // eslint-disable-next-line
        new URL(url)
    } catch (error) {
        throw new ValidationError('Link validation error; invalid url.', 'url')
    }
}
const getId = root => root._id || root.id
const buildRegex = val => ({ $regex: `.*${val}.*` })

/* eslint-disable camelcase, no-empty-pattern */
const buildFilters = ({ OR = [], description_contains, url_contains }) => {
    const filter = (description_contains || url_contains) ? {} : null
    if (description_contains) {
        filter.description = buildRegex(description_contains)
    }
    if (url_contains) {
        filter.url = buildRegex(url_contains)
    }
    let filters = filter ? [filter] : []
    for (let i = 0; i < OR.length; i++) {
        filters = filters.concat(buildFilters(OR[i]))
    }
    return filters
}
/* eslint-enable camelcase, no-empty-pattern */

class ValidationError extends Error {
    constructor (message, field) {
        super(message)
        this.field = field
    }
}

module.exports = {
    Query: {
        allLinks: (root, { filter, skip, first }, { mongo }) => {
            const query = filter ? { $or: buildFilters(filter) } : {}
            const cursor = mongo.Links.find(query)
            if (first) cursor.limit(first)
            if (skip) cursor.skip(skip)
            return cursor.toArray()
        },
        allVotes: (root, data, { mongo }) => {
            return mongo.Votes.find({}).toArray()
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo, user }) => {
            assertValidLink(data.url)
            const newLink = Object.assign({ postedById: user && getId(user) }, data)
            const response = await mongo.Links.insert(newLink)
            newLink.id = response.insertedIds[0]
            pubsub.publish('Link', { Link: { mutation: 'CREATED', node: newLink } })
            return Object.assign({ id: response.insertedIds[0] }, newLink)
        },
        createVote: async (root, { linkId }, { mongo, user }) => {
            const newVote = {
                userId: user && getId(user),
                linkId: new ObjectID(linkId)
            }
            const response = await mongo.Votes.insert(newVote)
            return Object.assign({ id: response.insertedIds[0] }, newVote)
        },
        createUser: async (root, data, { mongo }) => {
            const newUser = {
                name: data.name,
                email: data.authProvider.email.email,
                password: data.authProvider.email.password
            }
            const response = await mongo.Users.insert(newUser)
            return Object.assign({ id: response.insertedIds[0] }, newUser)
        },
        signinUser: async (root, { email: { email, password } }, { mongo }) => {
            const user = await mongo.Users.findOne({ email })
            if (user && user.password === password) {
                return { user, token: `token-${email}` }
            }
        }
    },
    Subscription: {
        Link: {
            subscribe: () => pubsub.asyncIterator('Link')
        }
    },
    Link: {
        id: getId,
        // using dataloaders
        postedBy: ({ postedById }, data, { dataloaders }) => dataloaders.userLoader.load(postedById),
        // example NOT using dataloaders
        // postedBy: ({ postedById }, data, { dataloaders, mongo }) => mongo.Users.findOne({ _id: postedById }),
        votes: ({ _id }, data, { mongo }) => mongo.Votes.find({ linkId: _id }).toArray()
        // votes: ({ _id }, data, { dataloaders }) => dataloaders.votesByLinkLoader.load(_id)
    },
    User: {
        id: getId,
        votes: ({ _id }, data, { mongo }) => mongo.Votes.find({ userId: _id }).toArray()
        // votes: ({ _id }, data, { dataloaders }) => dataloaders.votesByUserLoader.load(_id)
    },
    Vote: {
        id: getId,
        user: ({ userId }, data, { dataloaders }) => dataloaders.userLoader.load(userId),
        link: ({ linkId }, data, { mongo }) => mongo.Links.find({ _id: linkId }).toArray()
        // link: ({ linkId }, data, { dataloaders }) => dataloaders.linkLoader.load(linkId)
    }
}
