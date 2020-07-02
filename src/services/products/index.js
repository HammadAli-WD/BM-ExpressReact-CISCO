const express = require("express")
const fs = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")

const upload = multer({})

const {check, validationResult} = require("express-validator")

const router = express.Router()

const productsFolderPath = path.join(__dirname, "./photos")

const readFile = (fileName) => {
    const buffer = fs.readFileSync(path.join(__dirname, fileName))
    const fileContent = buffer.toString()
    return JSON.parse(fileContent)
}

const axios = require("axios")

router.get("/", (req, res, next) => {
    productsDB = readFile("products.json")

    if (req.query){
        if (req.query.category) {

            const filtered = productsDB.filter( product =>
                product.hasOwnProperty("category") &&
                product.category.toLowerCase() === req.query.category.toLowerCase()
            )
            res.send(filtered)
        } 
        else if (req.query.ids) {

            let _ids = String(req.query.ids).split(" ")

            if (_ids.length != 2) {
                let err = new Error()
                err.httpStatusCode = 400
                err.message = "Invalid number of prds to sum"
                next(err)
            }

            let prices = _ids.map( id => {
                let product = productsDB.find( product => 
                    product.id === id 
                )
                return product.price
            })
            
            let xml = `
                <soap12:Envelope 
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                    <soap12:Body>
                        <Add xmlns="http://tempuri.org/">
                            <intA>${prices[0]}</intA>
                            <intB>${prices[1]}</intB>
                        </Add>
                    </soap12:Body>
                </soap12:Envelope>
            `
           
            let config = {
                headers: {
                    'Content-Type': 'application/soap+xml; charset=utf-8'
                }
            };

            console.log(xml)
                      
            axios.post(
                "http://www.dneonline.com/calculator.asmx?op=Add", 
                xml, 
                config
            ).then(response => 
                res.send(response.data)
            )


        } 
        else {
            res.send(productsDB)
        }
    } else {
        res.send(productsDB)
    }
})

router.get("/:id", (req, res, next) => {
    try {
        const productsDB = readFile("products.json")
        const product = productsDB.filter((product) => product.id === req.params.id)

        res.send(product)
    } catch (error) {
        error.httpStatusCode = 404
        next(error) 
    }
})

router.get("/:id/reviews", (req,res, next) => {

    let product = readFile("products.json").find( product => 
        product.id === req.params.id
    )

    if (product) {
        let reviews = readFile("../reviews/reviews.json").filter( review => 
            review.elementId === product.id
        )

        res.send(reviews)
    } else {
        let err = new Error()
        err.message = "No products with this ID"
        err.httpStatusCode = 400
        next(err)
    }

})

router.post("/",
[
    check("name")
    .exists()
    .withMessage("all fields required")
    .not()
    .isEmpty()
    .withMessage("Can't be Empty"),
    check("description")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty"),
    check("brand")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty"),
    check("price")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty")
      .toInt(),
    check("category")
      .exists()
      .withMessage("all fields are required")
      .not()
      .isEmpty()
      .withMessage("Can't be Empty"),
],
(req, res, next) => {
    try {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const productsDB = readFile("products.json")
    const newProduct = {
          ...req.body, 
          id: uniqid(),
          createdAt: new Date(),
          updatedAt: new Date(),
      }
    productsDB.push(newProduct)
    fs.writeFileSync(path.join(__dirname, "products.json"),
    JSON.stringify(productsDB))
    res.status(201).send(newProduct)
    } catch (error) {
        next(error)
    }
}
)

/// Image Upload////
router.post("/:id/upload", upload.array("multipleImages"),
async (req, res, next) => {
try {
    const arrayOfPromises = req.files.map((file) =>
    fs.writeFile(path.join(productsFolderPath, file.originalname), file.buffer)
    )
    await Promise.all(arrayOfPromises)
    res.send("OK")
} catch (error) {
    console.log(error)
}
})

router.put("/:id", (req,res) => {
    let _createdAt
    const productsDB = readFile("products.json")
    const newDB = productsDB.filter((item) => {      
           
            item.id !== req.params.id
            _createdAt = item.createdAt
    
    } )
  
    let products = { 
       ...req.body, 
        id: req.params.id, 
        createdAt: _createdAt,
        updatedAt: new Date()
    }
    newDB.push(products)
    fs.writeFileSync(path.join(__dirname, "products.json"), JSON.stringify(newDB))
    res.send(newDB)
})


router.delete("/:id", (req, res) =>{
    const productsDB = readFile("products.json")
    const newDB= productsDB.filter((item) => item.id !== req.params.id)
    fs.writeFileSync(path.join(__dirname, "products.json"), JSON.stringify(newDB))

    res.send(newDB)
})
module.exports = router