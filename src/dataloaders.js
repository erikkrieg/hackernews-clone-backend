const DataLoader = require('dataloader')

const defaultLoaderConfig = {
    cacheKeyFn: key => key.toString()
}

function batch (Collection, keys) {
    return Collection.find({ _id: { $in: keys } }).toArray()
}

module.exports = ({ Users, Links, Votes }) => ({
    userLoader: new DataLoader(keys => batch(Users, keys), defaultLoaderConfig),
    linkLoader: new DataLoader(keys => batch(Links, keys), defaultLoaderConfig),
    voteLoader: new DataLoader(keys => batch(Votes, keys), defaultLoaderConfig)
})
