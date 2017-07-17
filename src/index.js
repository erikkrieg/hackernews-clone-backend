const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')

const schema = require('./schema')
const connectMongo = require('./mongo-connector')
const { authenticate } = require('./authentication')

const PORT = 3000
const endpointURL = '/graphql'

async function start () {
    const mongo = await connectMongo()
    const app = express()
    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users)
        return {
            schema,
            context: { mongo, user }
        }
    }

    app.use(endpointURL, bodyParser.json(), graphqlExpress(buildOptions))
    app.use('/graphiql', graphiqlExpress({
        endpointURL,
        passHeader: `'Authorization': 'bearer token-foo@bar'`
    }))

    app.listen(PORT, () => {
        console.log(`Hackernews GraphQL server running on port ${PORT}.`)
    })
}

start()
