import { insertPayloadData, insertTicketOrder } from "../supabase.js";
import { fetchAutumnFestivalAttendeeWebhook } from "../autumn_festival_attendee_webhook.js";
import { fetchAutumnFestivalForAttendeeV1Webhook } from "../autumn_festival_attendee_v1_webhook.js";
import { fetchAutumnFestivalForSponsorsWebhook } from "../autumn-festival-sponsor_webhook.js";
import { fetchAutumnFestivalForSpeakersWebhook } from "../autumn-festival-sepaker_webhook.js";

import { fetchMadWorldOrdersForEv_5929701Webhook } from "../mad_world_ev_5929701.js";
import { fetchMadWorldOrdersForEv_6098686Webhook } from "../mad_world_ev_6098686.js";
import { fetchMadWorldOrdersForEv_6098679Webhook } from "../mad_world_ev_6098679.js";
import { fetchMadWorldOrdersForEv_6430233Webhook } from "../mad_world_ev_6430233.js";
import { fetchMadWorldOrdersForEv_6098674Webhook } from "../mad_world_ev_6098674.js";

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
};

export const createOrder = async (req, res) => {
  try {
    const email = req.body?.payload?.buyer_details?.email;
    const ttEventId = req.body?.payload?.event_summary?.id;
    const e2mEventId = EVENT_ID_MAPPING[ttEventId];

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
    const orderResponse = await routeToHandler(targetFile, req, res);

    return orderResponse; // Response is handled by the target handler
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

const routeToHandler = async (targetFile, req, res) => {
  try {
    switch (targetFile) {
      case "autumn_festival_attendee_v1_webhook":
        return await fetchAutumnFestivalForAttendeeV1Webhook(req, res);
      case "autumn_festival_attendee_webhook":
        return await fetchAutumnFestivalAttendeeWebhook(req, res);
      case "autumn_festival_speaker_webhook":
        return await fetchAutumnFestivalForSpeakersWebhook(req, res);
      case "autumn_festival_sponsor_webhook":
        return await fetchAutumnFestivalForSponsorsWebhook(req, res);
      case "mad_world_ev_5929701":
        return await fetchMadWorldOrdersForEv_5929701Webhook(req, res);
      case "mad_world_ev_6098686":
        return await fetchMadWorldOrdersForEv_6098686Webhook(req, res);
      case "mad_world_ev_6098679":
        return await fetchMadWorldOrdersForEv_6098679Webhook(req, res);
      case "mad_world_ev_6430233":
        return await fetchMadWorldOrdersForEv_6430233Webhook(req, res);
      case "mad_world_ev_6098674":
        return await fetchMadWorldOrdersForEv_6098674Webhook(req, res);
      default:
        return res.status(400).json({
          success: false,
          error: "Unsupported file mapping",
        });
    }
  } catch (error) {
    console.error(
      `Error in handler for ${targetFile}:`,
      JSON.stringify(error, null, 2)
    );
    return res.status(500).json({
      success: false,
      error: `Failed to process handler for ${targetFile}`,
    });
  }
};
