module.exports = {
    Query: {
        allLinks: (root, data, { mongo }) => {
            return mongo.Links.find({}).toArray()
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo }) => {
            const response = await mongo.Links.insert(data)
            return Object.assign({ id: response.insertedIds[0] }, data)
        }
    },
    Link: {
        id: root => root._id || root.id
    }
}
