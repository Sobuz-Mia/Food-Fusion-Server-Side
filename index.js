const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    
    const foodsCollection = client.db("communityFoodDB").collection("foods");
    const foodsRequestCollection = client
      .db("communityFoodDB")
      .collection("requestCollection");

    // get only one food using id
    app.get("/api/v1/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });
    // get all foods and show ui
    app.get("/api/v1/foods", async (req, res) => {
      const result = await foodsCollection.find().toArray();
      res.send(result);
    });

    // manage my food request
    app.get('/api/v1/manage/single-food',async(req,res)=>{
        const email = req.query.email;
        const query = {donarEmail:email}
        const result = await foodsRequestCollection.find(query).toArray();
        res.send(result);
    })
    // get specific food used query email
    app.get("/api/v1/request-foods/", async (req, res) => {
        const email = req.query.email;
        const query = {requesterEmail:email}
      const result = await foodsRequestCollection.find(query).toArray();
      res.send(result);
    });
    // get single food
    app.get("/api/v1/request-food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsRequestCollection.findOne(query);
      res.send(result);
    });
    // foods item add
    app.post("/api/v1/foods", async (req, res) => {
      const food = req.body;
      const result = await foodsCollection.insertOne(food);
      res.send(result);
    });
    // save data from request
    app.post("/api/v1/request-foods", async (req, res) => {
      const food = req.body;
      const result = await foodsRequestCollection.insertOne(food);
      res.send(result);
    });
    // delate requested food
    app.delete("/api/v1/delete/request-food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsRequestCollection.deleteOne(query);
      res.send(result);
    });
    // update request food
    app.put("/api/v1/update/request-food/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          foodName: data.foodName,
          food_img: data.food_img,
          email: data.email,
          expDate: data.expDate,
          additional_Notes: data.additional_Notes,
          status: data.status,
          donateAmount: data.donateAmount,
        },
      };
      const result = await foodsRequestCollection.updateOne(
          filter,
          updateDoc,
          options
          );
          console.log(result)
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("community food sharing server is running");
});

app.listen(port, () => {
  console.log(`server listing on port ${port}`);
});
