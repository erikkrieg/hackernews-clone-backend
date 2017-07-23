const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const formatError = require('./formatError')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const cors = require('cors')

const schema = require('./schema')
const connectMongo = require('./mongo-connector')
const { authenticate } = require('./authentication')
const buildDataloaders = require('./dataloaders')

const PORT = 3000
const endpointURL = '/graphql'

async function start () {
    const mongo = await connectMongo()
    const app = express()
    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users)
        return {
            schema,
            formatError,
            context: {
                mongo,
                user,
                dataloaders: buildDataloaders(mongo)
            }
        }
    }

    app.use(endpointURL, cors(), bodyParser.json(), graphqlExpress(buildOptions))
    app.use('/graphiql', graphiqlExpress({
        endpointURL,
        passHeader: `'Authorization': 'bearer token-foo@bar'`,
        subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
    }))

    const server = createServer(app)
    server.listen(PORT, () => {
        // eslint-disable-next-line
        new SubscriptionServer(
            { execute, subscribe, schema },
            { server, path: '/subscriptions' }
        )
        console.log(`Hackernews GraphQL server running on port ${PORT}.`)
    })
}

start()
