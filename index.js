import express from "express";
import { fetchRetailXOrders } from "./fetchDetails.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World");
});


// Update your route to properly handle async operations
app.get("/push-retailx-data", fetchRetailXOrders);

app.listen(PORT, () => {
  console.log(`App is Listening to PORT ${PORT}`);
})