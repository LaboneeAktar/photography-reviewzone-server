const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//muddle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Photography Server API is Running...");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cybkh1s.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //services collection
    const servicesCollection = client
      .db("photographyReviewZone")
      .collection("services");

    //reviews collection
    const reviewCollection = client
      .db("photographyReviewZone")
      .collection("reviews");

    //send limited data
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    //send all service data
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //send single services data
    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      // console.log(service);
      res.send(service);
    });

    //get reviews data by service id
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }

      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //get reviews data by specific email
    app.get("/reviews/myreviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }

      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //reviews api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.send(result);
    });

    //delete review
    app.delete("/reviews/myreviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    //
  } catch (error) {
    console.log(error.name, error.message, error.stack);
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`Photography ReviewZone Server is Running on Port : ${port}`);
});
