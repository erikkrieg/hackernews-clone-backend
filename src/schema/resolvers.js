const getId = root => root._id || root.id

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
        id: getId
    },
    User: {
        id: getId
    }
}
