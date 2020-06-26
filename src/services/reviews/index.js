const express = require("express") // third party module
const fs = require("fs") // core module dedicated to file system interactions
const path = require("path") // core module
const uniqid = require("uniqid") // third party module
const { body, validationResult } = require('express-validator');

const router = express.Router()

const reviewsFile = path.join(__dirname, "reviews.json")
const productsFile = path.join(__dirname, "..", "products", "products.json")

function readFile(name) {
    const fileAsBuffer = fs.readFileSync(name)
    return JSON.parse(fileAsBuffer.toString())
}

router.get("/", (req,res) => {
    res.send(readFile(reviewsFile))
})

router.post("/", 
    [
        body('rate').isInt({ min:1, max:5 }),
        body('comment').exists(),
        body('elementId').custom( _id => 
            readFile(productsFile).some( _product => 
                _product._id === _id 
            )
        ),
    ],
  (req,res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        let err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
        } else {
            let reviews = readFile(reviewsFile)
        
            let newReview = { 
                ...req.body, 
                _id: uniqid(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        
            reviews.push(newReview)
        
            fs.writeFileSync(reviewsFile, JSON.stringify(reviews))
            res.status(201).send(newReview)
        }
    } catch (err) { next(err) }
})

router.put("/:id", 
    [
        body('rate').isInt({ min:1, max:5 }),
        body('comment').exists(),
        body('elementId').custom( _id => {
            readFile(productsFile).some( _product => 
                _product._id === _id 
            )
        }),
    ],
  (req,res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        let err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
        } else {
            let _createdAt

            let reviews = readFile(reviewsFile).filter( review => {
                if (review._id === req.params.id) {
                    _createdAt = review.createdAt
                    return false
                } else return true
            })

            let review = { 
                ...req.body, 
                _id: req.params.id, 
                createdAt: _createdAt,
                updatedAt: new Date()
            }

            reviews.push(review)
            fs.writeFileSync(reviewsFile, JSON.stringify(reviews))
            res.send("Ok")
        }
    } catch (err) { next(err) }
})

module.exports = router