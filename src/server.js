const express = require("express")
const cors = require("cors")

const productsService = require("./services/products")
const reviewsService = require("./services/reviews/")

const errorsHandler = require("./errorsHandler")
const server = express()

const listEndpoints = require("express-list-endpoints")
// const { serve } = require("swagger-ui-express")

server.use(express.json())
server.use(cors())

server.use("/products", productsService)
server.use("/reviews", reviewsService)

server.use(errorsHandler)
console.log(listEndpoints(server))

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const port = process.env.PORT || 5000;

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer"
      },
      servers: ["http://localhost:5000"]
    }
  },
  // ['.routes/*.js']
  apis: ["server.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
/**
 * @swagger
 * /customers:
 *  get:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
server.get("/customers", (req, res) => {
  res.status(200).send("Customer results");
});

/**
 * @swagger
 * /customers:
 *    put:
 *      description: Use to return all customers
 *    parameters:
 *      - name: customer
 *        in: query
 *        description: Name of our customer
 *        required: false
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '201':
 *        description: Successfully created user
 */
server.put("/customer", (req, res) => {
  res.status(200).send("Successfully updated customer");
});


server.listen(3001, () => {
    console.log("server running @ port 3001")
})