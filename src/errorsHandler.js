const handler = (err, req, res, next) => {
    res.status(err.httpStatusCode).send(err.message)
}

module.exports = handler  