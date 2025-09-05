import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Setup __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = "https://api.tickettailor.com/v1/orders";
const AUTH_TOKEN = "Basic c2tfNzIwOF8xNjUxMTFfZDM0NTQzYTU3OTg3ZGFjMjc1ODI0M2QzYmU2MDQ0OGI="; // replace with your actual token
const EVENT_ID = 'ev_4745831';

const normalize = (str) =>
  str?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') || '';

const fetchOrdersByCompany = async (targetCompanyName = 'GS1 UK') => {
  let allOrders = [];
  let nextCursor = null;

  const outputDir = path.join(__dirname, 'raw_orders');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {
    while (true) {
      let url = `${API_URL}?event_id=${EVENT_ID}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      const orders = response.data?.data || [];
      const validOrders = orders.filter((o) => o.status !== 'cancelled');
      allOrders.push(...validOrders);

      if (orders.length < 100) break;
      nextCursor = orders[orders.length - 1].id;
    }

    const filteredOrders = allOrders.filter((order) => {
      const customQuestions = order.buyer_details?.custom_questions || [];
      const companyAnswer = customQuestions.find((q) =>
        q.question?.toLowerCase().includes('company/organisation')
      )?.answer;

      return normalize(companyAnswer) === normalize(targetCompanyName);
    });
    console.log("🔍 Filtering orders for company:", filteredOrders);
    const outputFile = path.join(outputDir, `gs1uk_registrations.json`);
    fs.writeFileSync(outputFile, JSON.stringify(filteredOrders, null, 2));
    console.log(`✅ Found ${filteredOrders.length} registrations for "${targetCompanyName}"`);
    console.log(`📄 Saved to ${outputFile}`);

    return filteredOrders;
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    return [];
  }
};

// Run it
fetchOrdersByCompany('GS1 UK');
