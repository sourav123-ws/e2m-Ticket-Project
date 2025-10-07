import {  insertTicketOrder, updateTicketOrderStatus } from "../supabase.js";
import { fetchAutumnFestivalAttendeeWebhook } from "../autumn_festival_attendee_webhook.js";
import { fetchAutumnFestivalForAttendeeV1Webhook } from "../autumn_festival_attendee_v1_webhook.js";
import { fetchAutumnFestivalForSponsorsWebhook } from "../autumn-festival-sponsor_webhook.js";
import { fetchAutumnFestivalForSpeakersWebhook } from "../autumn-festival-sepaker_webhook.js";

import { fetchMadWorldOrdersForEv_5929701Webhook } from "../mad_world_ev_5929701.js";
import { fetchMadWorldOrdersForEv_6098686Webhook } from "../mad_world_ev_6098686.js";
import { fetchMadWorldOrdersForEv_6098679Webhook } from "../mad_world_ev_6098679.js";
import { fetchMadWorldOrdersForEv_6430233Webhook } from "../mad_world_ev_6430233.js";
import { fetchMadWorldOrdersForEv_6098674Webhook } from "../mad_world_ev_6098674.js";

import { fetchRetailXExecutiveOrdersForEv_6320483 } from "../brief_x_executive_ev_6320483.js";
import { fetchRetailXExecutiveOrdersForEv_6341249 } from "../brief_x_executive_ev_6341249.js"

import axios from "axios";

const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const EVENT_ID_MAPPING = {
  ev_6337457: "E1753774079219",
  ev_6803153: "E1753774079219",
  ev_6286249: "E1753774079219",
  ev_4733324: "E1753774079219",
  ev_6320483: "E1753774391797",
  ev_6341249: "E1753774391797",
  ev_5929701: "E1753776477925",
  ev_6098674: "E1753776477925",
  ev_6098679: "E1753776477925",
  ev_6098686: "E1753776477925",
  ev_6430233: "E1753776477925",
};

const FILE_MAPPING = {
  ev_4733324: "autumn_festival_attendee_v1_webhook",
  ev_6286249: "autumn_festival_attendee_webhook",
  ev_6803153: "autumn_festival_speaker_webhook",
  ev_6337457: "autumn_festival_sponsor_webhook",
  ev_5929701: "mad_world_ev_5929701",
  ev_6098686: "mad_world_ev_6098686",
  ev_6098679: "mad_world_ev_6098679",
  ev_6430233: "mad_world_ev_6430233",
  ev_6098674: "mad_world_ev_6098674",
  ev_6320483: "retailx_brief_executive_ev_6320483",
  ev_6341249: "retailx_brief_executive_ev_6341249"
};

export const createOrder = async (req, res) => {
  try {
    console.log("Webhook received:", req.body);
    const email = req.body?.payload?.buyer_details?.email;
    const ttEventId = req.body?.payload?.event_summary?.id;
    const e2mEventId = EVENT_ID_MAPPING[ttEventId];
    console.log("Mapped e2mEventId:", e2mEventId);
    console.log("Mapped ttEventId:", ttEventId);
    console.log("Email:", email);
    // Validate required fields
    if (!email || !ttEventId || !e2mEventId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields or invalid event mapping",
      });
    }

    // Insert order into database
    const result = await insertTicketOrder(
      email,
      e2mEventId,
      ttEventId,
      0,
      req.body,
      null
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to insert order",
      });
    }

    const targetFile = FILE_MAPPING[ttEventId];
    if (!targetFile) {
      return res.status(400).json({
        success: false,
        error: "No file mapping found for the provided event ID",
      });
    }
    // Route to the appropriate handler
    // For this example, we'll assume createOrder handles all mapped files
    // You can extend this to call different functions or endpoints based on targetFile
   
    const handlerData = await routeToHandler(targetFile, req, e2mEventId,ttEventId);
    return res.status(handlerData.status || 500).json(handlerData);

  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// export const createOrders = async (req, res) => {
//   try {
//     console.log("Webhook received:", req.body);
//     const payload = req.body;

//     const response = await insertPayloadData("ticket_tailor_order", payload); // Corrected table name
//     console.log("Insert response:", response);

//     if (!response.success) {
//       console.error(
//         "Failed to insert payload:",
//         JSON.stringify(response.error, null, 2)
//       );
//       return res.status(500).json({
//         success: false,
//         error: "Failed to save webhook data",
//       });
//     }

//     console.log("Webhook saved successfully:", response.data);
//     return res.status(200).json({
//       success: true,
//       message: "Webhook received and saved",
//     });
//   } catch (error) {
//     console.error("Error processing webhook:", JSON.stringify(error, null, 2));
//     return res.status(500).json({
//       success: false,
//       error: "Internal Server Error",
//     });
//   }
// };

// const routeToHandler = async (targetFile, req, res) => {
//     console.log("Routing to handler for file:", targetFile);
//     console.log("Request body:", JSON.stringify(req.body, null, 2));
//   try {
//     switch (targetFile) {
//       case "autumn_festival_attendee_v1_webhook":
//         return await fetchAutumnFestivalForAttendeeV1Webhook(req.body.payload, res);
//       case "autumn_festival_attendee_webhook":
//         return await fetchAutumnFestivalAttendeeWebhook(req.body.payload, res);
//       case "autumn_festival_speaker_webhook":
//         return await fetchAutumnFestivalForSpeakersWebhook(req.body.payload, res);
//       case "autumn_festival_sponsor_webhook":
//         return await fetchAutumnFestivalForSponsorsWebhook(req.body.payload, res);
//       case "mad_world_ev_5929701":
//         return await fetchMadWorldOrdersForEv_5929701Webhook(req.body.payload, res);
//       case "mad_world_ev_6098686":
//         return await fetchMadWorldOrdersForEv_6098686Webhook(req.body.payload, res);
//       case "mad_world_ev_6098679":
//         return await fetchMadWorldOrdersForEv_6098679Webhook(req.body.payload, res);
//       case "mad_world_ev_6430233":
//         return await fetchMadWorldOrdersForEv_6430233Webhook(req.body.payload, res);
//       case "mad_world_ev_6098674":
//         return await fetchMadWorldOrdersForEv_6098674Webhook(req.body.payload, res);
//       case "retailx_brief_executive_ev_6320483":
//         return await fetchRetailXExecutiveOrdersForEv_6320483(req.body.payload, res);
//       case "retailx_brief_executive_ev_6341249": 
//         return await fetchRetailXExecutiveOrdersForEv_6341249(req.body.payload, res);
//       case "test_event_webhook":
//          return await fetchTestEventWebhook(req.body.payload, res);
//       default:
//         return res.status(400).json({
//           success: false,
//           error: "Unsupported file mapping",
//         });
//     }
//   } catch (error) {
//     console.error(
//       `Error in handler for ${targetFile}:`,
//       JSON.stringify(error, null, 2)
//     );
//     return res.status(500).json({
//       success: false,
//       error: `Failed to process handler for ${targetFile}`,
//     });
//   }
// };


const routeToHandler = async (targetFile, req, e2mEventId,ttEventId) => {
  console.log("Routing to handler for file:", targetFile);
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    let handlerResponse;
    switch (targetFile) {
      case "autumn_festival_attendee_v1_webhook":
        handlerResponse = await fetchAutumnFestivalForAttendeeV1Webhook(req.body.payload);
        break;
      case "autumn_festival_attendee_webhook":
        handlerResponse = await fetchAutumnFestivalAttendeeWebhook(req.body.payload);
        break;
      case "autumn_festival_speaker_webhook":
        handlerResponse = await fetchAutumnFestivalForSpeakersWebhook(req.body.payload);
        break;
      case "autumn_festival_sponsor_webhook":
        handlerResponse = await fetchAutumnFestivalForSponsorsWebhook(req.body.payload);
        break;
      case "mad_world_ev_5929701":
        handlerResponse = await fetchMadWorldOrdersForEv_5929701Webhook(req.body.payload);
        break;
      case "mad_world_ev_6098686":
        handlerResponse = await fetchMadWorldOrdersForEv_6098686Webhook(req.body.payload);
        break;
      case "mad_world_ev_6098679":
        handlerResponse = await fetchMadWorldOrdersForEv_6098679Webhook(req.body.payload);
        break;
      case "mad_world_ev_6430233":
        handlerResponse = await fetchMadWorldOrdersForEv_6430233Webhook(req.body.payload);
        break;
      case "mad_world_ev_6098674":
        handlerResponse = await fetchMadWorldOrdersForEv_6098674Webhook(req.body.payload);
        break;
      case "retailx_brief_executive_ev_6320483":
        handlerResponse = await fetchRetailXExecutiveOrdersForEv_6320483(req.body.payload);
        break;
      case "retailx_brief_executive_ev_6341249":
        handlerResponse = await fetchRetailXExecutiveOrdersForEv_6341249(req.body.payload);
        break;
      default:
        return {
          success: false,
          status: 400,
          error: "Unsupported file mapping",
        };
    }

    if (!handlerResponse || !handlerResponse.success || !handlerResponse.payload) {
      return {
        success: false,
        status: 500,
        error: handlerResponse?.error || "Handler did not return a valid payload",
      };
    }

    const payload = handlerResponse.payload;
    const email = payload.data[0].Email;

    if (!e2mEventId) {
      return {
        success: false,
        status: 400,
        error: "Invalid event ID mapping",
      };
    }

    console.log(`📤 Pushing to API: ${payload.data[0].FirstName} ${payload.data[0].LastName} | ${email}`);
    try {
      const response = await axios.post(REGISTRATION_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("API response:", response.data);

      if (response.data?.status == 0 || response.data?.status == -1.5) {
        console.log(`✅ API push successful for: ${email}`);
        // await updateTicketOrderStatus(email, e2mEventId, ttEventId , 3, errorMsg);
        const updateResult = await updateTicketOrderStatus(email, e2mEventId, ttEventId , 1);
        if(!updateResult.success) {
          console.error("❌ Failed to update order status:", updateResult.error);
          return {
            success: false,
            status: 500,
          }
        }
        return {
          success: true,
          status: 200,
          message: `Order processed successfully for ${email}`,
          payload: payload
        };
      } else {
        const errorMsg = response.data?.message || "Unknown error from registration API";
        await updateTicketOrderStatus(email, e2mEventId, ttEventId , 1 , errorMsg);
        return {
          success: false,
          status: 500,
          error: `Failed to push order for ${email} to registration API`,
          apiError: response.data
        };
      }
    } catch (error) {
      console.error(`❌ Error pushing to API:`, error.response?.data || error.message);
      return {
        success: false,
        status: 500,
        error: `Failed to push order for ${email} to registration API`,
        apiError: error.response?.data || error.message
      };
    }
  } catch (error) {
    console.error(`Error in handler for ${targetFile}:`, {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      status: 500,
      error: `Failed to process handler for ${targetFile}: ${error.message || 'Unknown error'}`,
    };
  }
};