const express = require("express")
const cors = require("cors")

// const productsService = require("./services/products/")
const reviewsService = require("./services/reviews/")

const errorsHandler = require("./errorsHandler")
const server = express()

const listEndpoints = require("express-list-endpoints")

server.use(express.json())
server.use(cors())

// server.use("/products", productsService)
server.use("/reviews", reviewsService)

console.log(listEndpoints(server))

server.use(errorsHandler)

server.listen(3001, () => {
    console.log("server running @ port 3001")
})