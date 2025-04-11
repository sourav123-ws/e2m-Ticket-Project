import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.API_URL ;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const RETAILX_EVENT_ID = 'ev_4519856';


//fetch-sponser as key and values as details 

const fetchRetailXOrders = async () => {
  let sponsorOrders = [];
  let nextCursor = null;
  let groupedOrders = {};

  try {
    while (true) {
      let url = `${API_URL}?event_id=${RETAILX_EVENT_ID}`;
      if (nextCursor) {
        url += `&starting_after=${nextCursor}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      if (!response.data?.data || response.data.data.length === 0) {
        console.log('✅ No more data to fetch for RetailX Event.');
        break;
      }

      const orders = response.data.data;

      // Filter orders where description contains "Sponsor"
      const sponsorFiltered = orders.filter((order) =>
        (order.line_items?.some((item) => item.description.includes('Sponsor')) ||
          order.issued_tickets?.some((ticket) => ticket.description.includes('Sponsor')))
      );

      sponsorFiltered.forEach((order) => {
        // Log the full order data to check the structure
        console.log(`Full Order Data for Order ID: ${order.id}:`, JSON.stringify(order, null, 2));
      
        // Check if the custom questions are in the buyer details
        if (order.buyer_details?.custom_questions && Array.isArray(order.buyer_details.custom_questions)) {
          console.log(`Custom Questions for Order ID: ${order.id}:`, JSON.stringify(order.buyer_details.custom_questions, null, 2));
          
          // Find the specific custom question: "Company/Organisation"
          const companyQuestion = order.buyer_details.custom_questions.find(
            (q) => q.question === 'Company/Organisation'
          );

          if (companyQuestion && companyQuestion.answer && companyQuestion.answer.trim() !== '') {
            const answer = companyQuestion.answer.trim(); // Normalize the answer
            console.log(`Custom Question Answer for "Company/Organisation": "${answer}" for Order ID: ${order.id}`);

            if (!groupedOrders[answer]) {
              groupedOrders[answer] = [];
            }
            groupedOrders[answer].push(order);
          } else {
            console.log(`No valid answer for "Company/Organisation" for Order ID: ${order.id}`);
          }
        } else {
          console.log(`No custom questions found for Order ID: ${order.id}`);
        }
      });

      sponsorOrders.push(...sponsorFiltered);

      if (orders.length < 100) break;

      nextCursor = orders[orders.length - 1].id;
    }

    console.log(`🎟️ Total Sponsor Orders Processed: ${sponsorOrders.length}`);
    console.log('📝 Grouped Sponsor Orders by "Company/Organisation" Answer:');

    if (Object.keys(groupedOrders).length === 0) {
      console.log('❌ No grouped orders found based on "Company/Organisation" answers.');
    } else {
      for (const [answer, grouped] of Object.entries(groupedOrders)) {
        console.log(`Answer: "${answer}" => ${grouped.length} Orders`);
      }

      fs.writeFileSync('grouped_sponsor_orders.json', JSON.stringify(groupedOrders, null, 2));
    }

  } catch (error) {
    console.error('❌ Error fetching RetailX orders:', error.response?.data || error.message);
  }
};




