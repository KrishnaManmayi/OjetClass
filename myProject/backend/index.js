require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./db/db');
const vendor = require('./db/Vendor');

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello world");
})

app.get('/getAllProducts', async (req,res) =>{
    const products = await db.find();
    res.status(200).json(products);
})

app.get('/getProduct/:id', async (req, res) => {
    const product = await db.findById(req.params.id);
    res.status(200).json(product);
})

app.post('/createProduct', async (req, res) => {
    const body = req.body;
    const data = await db.create(body);
    res.status(201).json({msg: 'product created successfully', data: data});
})

app.post("/updateProduct/:id", async(req, res) => {
    try {
        const product = await db.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      }
})

app.delete("/deleteProduct/:id", async(req, res) => {
    try {
        const product = await db.findByIdAndDelete(req.params.id);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      }
})

app.post('/vendorLogin', async (req, res) => {
    const body = req.body;

    const count = await vendor.find({email: body.email, pass: body.pass}).countDocuments();
    if(count == 1) { // user exist
        res.send({msg: "Login successfull"})
    } else {
        res.send({msg: "Login failed"})
    }
})

app.post('/vendorRegister', async (req, res) => {
    const body = req.body;
    const data = await vendor.create(body);
    res.status(201).json({msg: 'Vendor created successfully', data: data});
})

app.listen(process.env.PORT, () => console.log("app started"));