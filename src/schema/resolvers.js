const { ObjectID } = require('mongodb')

const getId = root => root._id || root.id

module.exports = {
    Query: {
        allLinks: (root, data, { mongo }) => {
            return mongo.Links.find({}).toArray()
        },
        allVotes: (root, data, { mongo }) => {
            return mongo.Votes.find({}).toArray()
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo, user }) => {
            const newLink = Object.assign({ postedById: user && getId(user) }, data)
            const response = await mongo.Links.insert(newLink)
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
