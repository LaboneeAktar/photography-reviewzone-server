const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cybkh1s.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const servicesCollection = client
      .db("photographyReviewZone")
      .collection("services");
  } catch (error) {
    console.log(error.name, error.message, error.stack);
  } finally {
  }
}
run();

app.get("/", (req, res) => {
  res.send("Photgraphy Api is running");
});

app.listen(port, () => {
  console.log("Photography ReviewZone Server is Running on Port :", port);
});
