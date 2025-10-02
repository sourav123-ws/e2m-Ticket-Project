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
import { fetchMadWorldOrdersForEv_5929701 } from "./madWorld/ev_5929701.js";
import { fetchMadWorldOrdersForEv_6098686 } from "./madWorld/ev_6098686.js";
import { fetchMadWorldOrdersForEv_6098679 } from "./madWorld/ev_6098679.js";
import { fetchMadWorldOrdersForEv_6430233 } from "./madWorld/ev_6430233.js";
import { fetchMadWorldOrdersForEv_6098674 } from "./madWorld/ev_6098674.js";
import { fetchRetailXExecutiveOrdersForEv_6341249 } from "./retailxBriefExecutive/ev_6341249.js";
import { fetchRetailXExecutiveOrdersForEv_6320483 } from "./retailxBriefExecutive/ev_6320483.js";
import { fetchAutumnFestivalForSpeakers } from "./autumn-festival-sepaker.js";
import { fetchAutumnFestivalV2 } from "./autumnFestivalV2.js";
import { fetchAutumnFestivalForSponsorsV1 } from "./autumn_festival_sponsor_v1.js";
dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World 5");
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
app.get("/fetch-autumn-festival-attendee_v2",fetchAutumnFestivalV2);
app.get("/fetch-autumn-festival-sponsor",fetchAutumnFestivalForSponsors);
app.get("/fetch-autumn-festival-sponsor-v1",fetchAutumnFestivalForSponsorsV1);
app.get("/fetch-autumn-festival-speaker",fetchAutumnFestivalForSpeakers);

app.get("/fetch-madworld/ev_5929701",fetchMadWorldOrdersForEv_5929701);
app.get("/fetch-madworld/ev_6098686",fetchMadWorldOrdersForEv_6098686);
app.get("/fetch-madworld/ev_6098679",fetchMadWorldOrdersForEv_6098679);
app.get("/fetch-madworld/ev_6430233",fetchMadWorldOrdersForEv_6430233);
app.get("/fetch-madworld/ev_6098674",fetchMadWorldOrdersForEv_6098674);

app.get("/fetch-retailx-brief-executive/ev_6341249",fetchRetailXExecutiveOrdersForEv_6341249) ;
app.get("/fetch-retailx-brief-executive/ev_6320483",fetchRetailXExecutiveOrdersForEv_6320483) ;


app.get("/push-all-data",fetchSpringFestivalOrders) ;




app.listen(PORT, () => {
  console.log(`App is Listening to PORT ${PORT}`);
})
