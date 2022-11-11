const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yhghpmr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('travelo').collection('services');
        const serviceComments = client.db('travelo').collection('comments')
        app.get('/services',async(req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query);
            const services= await cursor.toArray();
            res.send(services);
            
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result)
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