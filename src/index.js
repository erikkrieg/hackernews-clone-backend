const express = require('express')
const bodyParse = require('body-parser')
const { graphqlExpress } = require('graphql-server-express')

const schema = require('./schema')

const PORT = 3000
const app = express()

app.use('/graphql', bodyParse.JSON(), graphqlExpress({schema}))

app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
})
