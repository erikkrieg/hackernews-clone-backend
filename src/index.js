const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('graphql-server-express')

const schema = require('./schema')

const PORT = 3000
const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
})
