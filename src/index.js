const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')

const schema = require('./schema')
const connectMongo = require('./mongo-connector')

const PORT = 3000
const endpointURL = '/graphql'

async function start () {
    const mongo = await connectMongo()
    const app = express()

    app.use(endpointURL, bodyParser.json(), graphqlExpress({
        schema,
        context: { mongo }
    }))
    app.use('/graphiql', graphiqlExpress({ endpointURL }))

    app.listen(PORT, () => {
        console.log(`Hackernews GraphQL server running on port ${PORT}.`)
    })
}

start()
