const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yhghpmr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ meassage: 'unathorized 1  Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.APP_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized 2 Access' })
        }
        req.decoded = decoded;
        next()
    })
}

async function run(){
    try{
        const serviceCollection = client.db('travelo').collection('services');
        const serviceComments = client.db('travelo').collection('comments')
       
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log( user )
            const token = jwt.sign(user, process.env.APP_SECRET, { expiresIn: '1h' })
            console.log(token);
            res.send({ token })
        })
        app.get('/services',async(req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query);
            const services= await cursor.toArray();
            res.send(services);
            
        });
        app.get('/reviews',async(req,res)=>{
            const query = {}
            const cursor = serviceComments.find(query).sort({ time: -1 });
            const comments= await cursor.toArray();
            res.send(comments);
            
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result)
        });
        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const comments = await serviceComments.findOne(query);
            res.send(comments)
        });
        app.post('/services', async (req, res) => {
            let services = req.body
            const query = await serviceCollection.insertOne(services);
            res.send(query)
        });
        app.put('/allreview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const body = req.body;
            console.log(body)
            const option = { upsert: true }
            const updateUser = {
                $set: {
                    review: body.review,
                }
            }
            const result = await serviceComments.updateOne(filter, updateUser, option)
            res.send(result)
        })



       

        app.get('/comments',verifyJWT,async(req,res)=>{
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'Forbidend access' })
            }

            let query = {}

            if (req.query.email) {
                query = {
                    customerEmail: req.query.email
                }
            }
            const cursor = serviceComments.find(query);
            const comments= await cursor.toArray();
            res.send(comments);
            
        });

         app.get('/Allcomments',async(req,res)=>{
            const query = {}
            const cursor = serviceComments.find(query);
            const comments= await cursor.toArray();
            res.send(comments);
            
        });

         
        app.post('/comments', async (req, res) => {
            let comments = req.body
            const query = await serviceComments.insertOne(comments);
            res.send(query)
        });
       
        app.delete('/comments/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const comments = await serviceComments.deleteOne(query);
            res.send(comments);
        })
    }
    finally{

    }
   
}

run().catch(err =>console.error(err));


app.get('/',(req,res)=>{
    res.send('Travelo server is running')
})

app.listen(port,()=>{
    console.log(`Travelo running on${port}`);
})