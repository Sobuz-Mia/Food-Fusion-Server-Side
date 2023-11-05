const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
// community-food-sharing
// WNRjdXpk3vzvaYG8

// middleware
app.use(cors());
app.use(express());



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const featuresCollection = client.db('communityFoodDB').collection('allFeatures');

    app.get('/api/v1/all-features',async (req,res)=>{
        const cursor = featuresCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('community food sharing server is running')
})

app.listen(port,()=>{
    console.log(`server listing on port ${port}`)
})