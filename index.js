import express from "express";
import dotenv from "dotenv";
import { fetchRetailXOrders } from "./RetailX.js";
import { fetchAmazonSellerSummitOrders } from "./AmazonSellerSummit.js";
import { fetchSubscriptionXOrders } from "./SubscriptionX.js";
import { fetchSocialMediaMastersOrders } from "./SocialMediaMasters.js";
import { fetchAndGroupSponsors } from "./SubscriptionJSON.js";
dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World");
});


// Update your route to properly handle async operations
app.get("/push-retailx-data", fetchRetailXOrders);
app.get("/push-subscription-data", fetchSubscriptionXOrders);
app.get("/push-amazon-data", fetchAmazonSellerSummitOrders);
app.get("/push-social-media-data", fetchSocialMediaMastersOrders);


app.get("/subscription-json",fetchAndGroupSponsors)




app.listen(PORT, () => {
  console.log(`App is Listening to PORT ${PORT}`);
})