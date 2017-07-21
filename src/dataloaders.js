const DataLoader = require('dataloader')

function batchUsers (Users, keys) {
    return Users.find({ _id: { $in: keys } }).toArray()
}

function batchLinks (Links, keys) {
    return Links.find({ _id: { $in: keys } }).toArray()
}

async function batchVotes (Votes, prop, keys) {
    return [await Votes.find({ [prop]: { $in: keys } }).toArray()]
}

module.exports = ({ Users, Links, Votes }) => ({
    userLoader: new DataLoader(keys => batchUsers(Users, keys), {
        cacheKeyFn: key => key.toString()
    }),
    linkLoader: new DataLoader(keys => batchLinks(Links, keys), {
        cacheKeyFn: key => key.toString()
    }),
    voteLoader: new DataLoader(keys => batchVotes(Votes, '_id', keys), {
        cacheKeyFn: key => key.toString()
    }),
    votesByUserLoader: new DataLoader(keys => batchVotes(Votes, 'userId', keys), {
        cacheKeyFn: key => `votes-for-user-${key.toString()}`
    }),
    votesByLinkLoader: new DataLoader(keys => batchVotes(Votes, 'linkId', keys), {
        cacheKeyFn: key => `votes-for-link-${key.toString()}`
    })
})
