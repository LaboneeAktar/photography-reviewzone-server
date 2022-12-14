const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
var jwt = require("jsonwebtoken");

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

//verify jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    //jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h",
      });
      res.send({ token });
    });

    //send limited data
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection
        .find(query)
        .sort({ $natural: -1 })
        .limit(3);
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

    app.post("/allservices", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    //get reviews data by service id
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }

      const cursor = reviewCollection.find(query).sort({ time: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //get reviews data by specific email
    app.get("/reviews/myreviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      // console.log(decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbidden Access" });
      }

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
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    //update reviews
    app.patch("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.updateOne(query, {
        $set: req.body,
      });
      res.send(result);
    });

    //delete review
    app.delete("/reviews/myreviews/:id", verifyJWT, async (req, res) => {
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
