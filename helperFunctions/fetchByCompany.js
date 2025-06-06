import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Define __dirname and __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = "https://api.tickettailor.com/v1/orders";
const AUTH_TOKEN = "Basic c2tfNzIwOF8xNjUxMTFfZDM0NTQzYTU3OTg3ZGFjMjc1ODI0M2QzYmU2MDQ0OGI=";
const SPRING_FESTIVAL_EVENT_ID = 'ev_4745831';

const companyWithCode = [
  { key: 'dunnhumby', value: '36186000' },
  { key: 'Numberly', value: '36187000' },
  { key: 'Mirakl', value: '36188000' },
  { key: 'PRN', value: '36189000' },
  { key: 'SAVI', value: '36190000' },
  { key: 'Commerce IQ', value: '36191000' },
  { key: 'Nectar 360', value: '36192000' },
  { key: 'RetailX', value: '36193000' },
  { key: 'FMCG Guys', value: '36194000' },
];

export const checkCompanyRegistrations = async (companyName) => {
  // Validate inputs
  if (!companyName) {
    const errorMsg = 'Company name parameter is required';
    console.error(`❌ ${errorMsg}`);
    const outputDir = path.join(__dirname, 'raw_orders');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const errorFile = path.join(outputDir, 'company_registrations_error.json');
    fs.writeFileSync(errorFile, JSON.stringify({ error: errorMsg }, null, 2));
    console.log(`📄 Saved error to ${errorFile}`);
    return [];
  }

  // Validate environment variables
  if (!API_URL || !AUTH_TOKEN) {
    const errorMsg = `Missing environment variables: API_URL=${API_URL}, AUTH_TOKEN=${AUTH_TOKEN ? 'set' : 'unset'}`;
    console.error(`❌ ${errorMsg}`);
    const outputDir = path.join(__dirname, 'raw_orders');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const errorFile = path.join(outputDir, 'company_registrations_error.json');
    fs.writeFileSync(errorFile, JSON.stringify({ error: errorMsg }, null, 2));
    console.log(`📄 Saved error to ${errorFile}`);
    return [];
  }

  let allOrders = [];
  let nextCursor = null;

  // Create directory for output if it doesn't exist
  const outputDir = path.join(__dirname, 'raw_orders');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }

  try {
    // Fetch all orders for the event
    while (true) {
      let url = `${API_URL}?event_id=${SPRING_FESTIVAL_EVENT_ID}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;
      console.log('Constructed URL:', url); // Debug URL

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      if (!response.data.data || response.data.data.length === 0) break;

      const orders = response.data.data;
      const validOrders = orders.filter((order) => order && order.status !== 'cancelled');

      allOrders.push(...validOrders);
      if (orders.length < 100) break;
      nextCursor = orders[orders.length - 1].id;
    }

    console.log(`✅ Fetched ${allOrders.length} total orders`);

    // Filter orders for the specified company
    const normalize = (str) =>
      str?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') || '';

    const companyOrders = allOrders.filter((order) => {
      const customQuestions = order.buyer_details?.custom_questions || [];
      const companyAnswer = customQuestions.find((q) =>
        q.question?.trim().toLowerCase().includes('company/organisation')
      )?.answer || '';
      return normalize(companyAnswer) === normalize(companyName);
    });

    if (companyOrders.length === 0) {
      console.log(`⚠️ No registrations found for ${companyName} company.`);
      return [];
    }

    console.log(`✅ Found ${companyOrders.length} registration(s) for ${companyName} company:`);
    companyOrders.forEach((order, index) => {
      console.log(
        `📋 Registration ${index + 1}: ${order.buyer_details?.first_name} ${
          order.buyer_details?.last_name
        } | ${order.buyer_details?.email} | QR: ${order.issued_tickets?.[0]?.barcode || 'N/A'}`
      );
    });

    // Write company orders to a JSON file
    const safeCompanyName = normalize(companyName); // Avoid invalid characters in filename
    const outputFile = path.join(outputDir, `${safeCompanyName}_registrations.json`);
    fs.writeFileSync(outputFile, JSON.stringify(companyOrders, null, 2));
    console.log(`📄 Saved ${companyOrders.length} ${companyName} registrations to ${outputFile}`);

    return companyOrders;

  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    const errorFile = path.join(outputDir, 'company_registrations_error.json');
    fs.writeFileSync(
      errorFile,
      JSON.stringify({ error: error.message }, null, 2)
    );
    console.log(`📄 Saved error to ${errorFile}`);
    return [];
  }
};

// Example usage
checkCompanyRegistrations('Numberly').then((orders) => {
  console.log('Returned orders:', JSON.stringify(orders, null, 2));
});