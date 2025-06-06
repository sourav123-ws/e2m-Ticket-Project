import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = "https://api.tickettailor.com/v1/orders";
const AUTH_TOKEN = "Basic c2tfNzIwOF8xNjUxMTFfZDM0NTQzYTU3OTg3ZGFjMjc1ODI0M2QzYmU2MDQ0OGI=";
const SPRING_FESTIVAL_EVENT_ID = 'ev_4745831';

export const fetchFMCGOrdersByEmail = async (email) => {
  let allOrders = [];
  let nextCursor = null;

  try {
    // Fetch all orders for the event
    while (true) {
      let url = `${API_URL}?event_id=${SPRING_FESTIVAL_EVENT_ID}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      if (!response.data.data || response.data.data.length === 0) break;

      const orders = response.data.data;
      allOrders.push(...orders);

      if (orders.length < 100) break;
      nextCursor = orders[orders.length - 1].id;
    }

    // Filter orders by the provided email
    const matchingOrders = allOrders.filter(
      (order) => order?.buyer_details?.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchingOrders.length === 0) {
      console.log(`⚠️ No orders found for email: ${email}`);
      return [];
    }

    console.log(`✅ Found ${matchingOrders.length} order(s) for email: ${email}`);
    return matchingOrders;

  } catch (error) {
    console.error(`❌ Error fetching orders for email ${email}:`, error.message);
    return [];
  }
};

fetchFMCGOrdersByEmail('thibaut@numberly.com').then(orders => console.log(JSON.stringify(orders, null, 2)));