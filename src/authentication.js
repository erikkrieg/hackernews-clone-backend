const HEADER_REGEX = /bearer token-(.*)$/

/**
 * This is a simple token for demonstration. Consider JWT (https://jwt.io/) for production.
 */
module.exports.authenticate = ({ headers: { authorization } }, Users) => {
    const email = authorization && HEADER_REGEX.exec(authorization)[1]
    return email && Users.findOne({ email })
}
