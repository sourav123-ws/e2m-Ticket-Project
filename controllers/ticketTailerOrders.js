import { insertPayloadData, insertTicketOrder } from "../supabase.js";

export const createOrders = async (req, res) => {
  try {
    console.log("Webhook received:", req.body);
    const payload = req.body;

    const response = await insertPayloadData("ticket_tailer_order", payload);
    console.log("Insert response:", response);
    if (!response.success) {
      console.error("Failed to insert payload:", response.error);
      return res.status(500).json({
        success: false,
        error: "Failed to save webhook data",
      });
    }

    console.log("Webhook saved successfully:", response.data);
    return res.status(200).json({
      success: true,
      message: "Webhook received and saved",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const email = "sourav.bhattacherjee@webspiders.com";
    const e2mEventId = "E1753774079219";
    const ttEventId = "ev_4733324";
    const status = 0;
    const payload = {
      orderId: "ORD123",
      quantity: 2,
      ticketType: "VIP",
      price: 99.99
    };
    const errorMsg = {
      code: "ERR_001",
      message: "Payment gateway timeout"
    };

    // Validate payload and error are JSON-compatible or null
    if (payload !== null) {
      try {
        if (typeof payload !== 'object') throw new Error('Payload must be a valid JSON object or null');
      } catch (err) {
        return res.status(400).json({ success: false, error: 'Invalid payload format' });
      }
    }
    if (errorMsg !== null) {
      try {
        if (typeof errorMsg !== 'object') throw new Error('Error must be a valid JSON object or null');
      } catch (err) {
        return res.status(400).json({ success: false, error: 'Invalid error format' });
      }
    }

    const result = await insertTicketOrder(
      email,
      e2mEventId,
      ttEventId,
      status,
      payload,
      errorMsg
    );
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to insert order",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
