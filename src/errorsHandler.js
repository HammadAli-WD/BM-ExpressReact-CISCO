const handler = (err, req, res, next) => {
    console.log(err)
    res.status(err.httpStatusCode).send(err.message)
}

module.exports = handler  