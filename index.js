import express from "express";
import dotenv from "dotenv";
import { fetchRetailXOrders } from "./RetailX.js";
import { fetchAmazonSellerSummitOrders } from "./AmazonSellerSummit.js";
import { fetchSubscriptionXOrders } from "./SubscriptionX.js";
import { fetchSocialMediaMastersOrders } from "./SocialMediaMasters.js";
import { fetchCustomerXOrders } from "./CustomerX.js";
import { fetchDigitalMarketingEvolutionXOrders } from "./DigitalMarketingEvolution.js";
import { fetchSustainabilityXOrders } from "./SustainabilityX.js";
import { fetchSpringFestivalOrders } from "./AllEvents.js";
import { fetchFMCGOrders } from "./FMCG.js";
import { fetchAutumnFestival } from "./autumnFestival.js";
import { fetchAutumnFestivalForSponsors } from "./autumn-festival-sponsor.js";
dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World 2");
});


// Update your route to properly handle async operations
app.get("/push-retailx-data", fetchRetailXOrders);
app.get("/push-subscription-data", fetchSubscriptionXOrders);
app.get("/push-amazon-data", fetchAmazonSellerSummitOrders);
app.get("/push-customerx-data",fetchCustomerXOrders);
app.get("/push-digital-marketting-data",fetchDigitalMarketingEvolutionXOrders);
app.get("/push-social-media-data", fetchSocialMediaMastersOrders);
app.get("/push-sustainability-data",fetchSustainabilityXOrders)
app.get("/push-fmcg-data",fetchFMCGOrders)
app.get("/fetch-autumn-festival-attendee",fetchAutumnFestival);
app.get("/fetch-autumn-festival-sponsor",fetchAutumnFestivalForSponsors);

app.get("/push-all-data",fetchSpringFestivalOrders)




app.listen(PORT, () => {
  console.log(`App is Listening to PORT ${PORT}`);
})
