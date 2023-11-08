const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware for verify token

const tokenVerify = (req,res,next) =>{
  const token = req.cookies?.access_token;
  if(!token){
    return res.status(401).send({message:'Unauthorized'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
    if(error){
      res.status(403).send({message: 'Forbidden'})
    }
    req.user = decoded;
    next();
  })
}


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
    app.get("/api/v1/manage/single-food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { food_id : id };
        const result = await foodsRequestCollection.findOne(query)
        res.send(result);
    
    });
    // get specific food for manage food of used query email
    app.get("/api/v1/manage-foods/", async (req, res) => {
      const email = req.query.email;
      const query = { donarEmail: email };
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    // get my booking data form request collection

    app.get("/api/v1/myRequest/food", async (req, res) => {
      const email = req.query.email;
      const query = { requesterEmail: email };
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

    // jwt token generate

    app.post('/api/vi/jwt',(req,res)=>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{
        expiresIn:'1h'
      });

      res
      .cookie('access_token',token,{
        httpOnly:true,
        secure:false,
      })
      .send({success:true})
    })

    // foods item add
    app.post("/api/v1/foods", async (req, res) => {
      const food = req.body;
      const result = await foodsCollection.insertOne(food);
      res.send(result);
    });

    // update status form manage route
    app.patch("/api/v1/update-status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const query = {food_id : id}
      const status = req.body;
      const updateStatus = {
        $set: {
          status: status.status,
        },
      };
      const result = await foodsCollection.updateOne(
        filter,
        updateStatus
      );
      const foodStatus = await foodsRequestCollection.updateOne(query,updateStatus)
      res.send({result,foodStatus});
    });
    // update status on foodsCollection

 
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
      const result = await foodsCollection.deleteOne(query);
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
