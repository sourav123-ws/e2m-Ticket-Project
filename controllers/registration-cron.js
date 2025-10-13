import {
  getOrdersWithPendingStatus,
  updateOrderErrorStatus,
} from "../supabase.js";
import { REGISTRATION_API_URL } from "./ticketTailerOrders.js";
import axios from "axios";

export const registrationCron = async (req, res) => {
  try {
    // Fetch all pending orders
    const fetchRes = await getOrdersWithPendingStatus();

    if (!fetchRes.success) {
      console.error("❌ Error fetching orders:", fetchRes.error);
      if (res)
        return res.status(500).json({ error: "Failed to fetch orders." });
      return { success: false, error: "Failed to fetch orders." };
    }

    const orders = fetchRes.data || [];

    if (orders.length === 0) {
      console.log("ℹ️ No pending orders found");
      if (res)
        return res
          .status(200)
          .json({ message: "No pending orders to process." });
      return { success: true, message: "No pending orders to process." };
    }

    console.log(`📋 Processing ${orders.length} order(s)...`);

    for (const order of orders) {
      const { email, e2m_event_id, tt_event_id, payload } = order;
      console.log("\n🔄 Processing order:", email);

      try {
        const apiResponse = await axios.post(REGISTRATION_API_URL, payload, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("➡️ API Response:", apiResponse.data);

        if (apiResponse.data.status == 0 || apiResponse.data.status == -1.5) {
          // Success -> status='1', error_flag=false
          const updateRes = await updateOrderErrorStatus(
            email,
            e2m_event_id,
            tt_event_id,
            "1",
            null,
            false
          );
          if (updateRes.success) {
            console.log("✅ Order updated to success status");
          }
        } else {
          // API returned failure -> status='0', error_flag=true
          const updateRes = await updateOrderErrorStatus(
            email,
            e2m_event_id,
            tt_event_id,
            "0",
            JSON.stringify(apiResponse.data),
            true
          );
        }
        
      } catch (error) {
        console.error("❌ Error registering attendee:", error.message);
      }
    }

    console.log("\n✅ Registration cron job completed");

    const result = {
      success: true,
      message: "Registration cron job executed successfully.",
      processed: orders.length,
    };

    if (res) return res.status(200).json(result);
    return result;
  } catch (err) {
    console.error("❌ Exception in registrationCron:", err.message);
    if (res)
      return res.status(500).json({ success: false, error: err.message });
    return { success: false, error: err.message };
  }
};

// Run immediately
registrationCron();
