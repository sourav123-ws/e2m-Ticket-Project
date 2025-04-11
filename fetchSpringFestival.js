import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();


const API_URL = process.env.API_URL ;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SPRING_FESTIVAL_EVENT_ID = 'ev_4644551';
const QUESTION_TEXT = "Which event at the Spring Retail Festival are you attending?";

const fetchSpringFestivalOrders = async () => {
    let allOrders = [];
    let nextCursor = null;

    try {
        while (true) {
            let url = `${API_URL}?event_id=${SPRING_FESTIVAL_EVENT_ID}`;
            if (nextCursor) {
                url += `&starting_after=${nextCursor}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: AUTH_TOKEN },
            });

            if (!response.data.data || response.data.data.length === 0) {
                console.log("✅ No more data to fetch for Spring Festival Event.");
                break;
            }

            const orders = response.data.data;
            allOrders.push(...orders);

            if (orders.length < 100) break;

            nextCursor = orders[orders.length - 1].id;
        }

        console.log(`✅ Fetched ${allOrders.length} orders for Spring Festival Event.`);

        const groupedOrders = {};

        allOrders.forEach((order, index) => {
            const issuedTickets = order.issued_tickets || [];

            // Filter only orders with "Sponsors" in the description
            issuedTickets.forEach((ticket) => {
                const description = ticket?.description?.toLowerCase() || '';
                if (description.includes("sponsors")) {

                    const customQuestions = order.buyer_details?.custom_questions || [];

                    customQuestions.forEach((question) => {
                        const questionText = question?.question?.trim();
                        const answerText = question?.answer?.trim();

                        if (!questionText || !answerText) {
                            console.log("⚠️ Skipping: Missing question or answer");
                            return;
                        }

                        if (questionText.toLowerCase().includes(QUESTION_TEXT.toLowerCase())) {

                            if (!groupedOrders[answerText]) {
                                groupedOrders[answerText] = [];
                            }

                            groupedOrders[answerText].push(order);
                        }
                    });
                }
            });
        });

        // Save filtered orders to a file
        fs.writeFileSync(
            "spring_festival_grouped_orders_sponsors.json",
            JSON.stringify(groupedOrders, null, 2)
        );

        console.log("✅ Data saved to spring_festival_grouped_orders_sponsors.json");
        return groupedOrders;
    } catch (error) {
        console.error("❌ Error fetching orders:", error.response?.data || error.message);
        return {};
    }
};

