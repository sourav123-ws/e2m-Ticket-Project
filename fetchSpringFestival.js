import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SPRING_FESTIVAL_EVENT_ID = 'ev_4644551';
const QUESTION_TEXT = "Which event at the Spring Retail Festival are you attending?";

const fetchSpringFestivalOrders = async () => {
    let allOrders = [];
    let nextCursor = null;

    try {
        // Fetch all orders with pagination
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

            if (orders.length < 100) break; // Stop if last page (<100 records)

            nextCursor = orders[orders.length - 1].id;
        }

        console.log(`✅ Fetched ${allOrders.length} orders for Spring Festival Event.`);

        const groupedOrders = {};

        allOrders.forEach((order) => {
            const customQuestions = order.buyer_details?.custom_questions || [];

            customQuestions.forEach((question) => {
                const questionText = question?.question?.trim();
                const answerText = question?.answer?.trim();

                // Skip if question/answer is missing or doesn't match
                if (!questionText || !answerText) return;
                if (!questionText.toLowerCase().includes(QUESTION_TEXT.toLowerCase())) return;

                // Group by answer (e.g., "Amazon Sellers Summit")
                if (!groupedOrders[answerText]) {
                    groupedOrders[answerText] = [];
                }
                groupedOrders[answerText].push(order);
            });
        });

        // Save results to a file
        fs.writeFileSync(
            "spring_festival_all_grouped_orders.json",
            JSON.stringify(groupedOrders, null, 2)
        );

        console.log("✅ All orders grouped by event and saved to 'spring_festival_all_grouped_orders.json'");
        return groupedOrders;
    } catch (error) {
        console.error("❌ Error fetching orders:", error.response?.data || error.message);
        fs.writeFileSync(
            "spring_festival_orders_ERROR.json",
            JSON.stringify(
                { error: error.response?.data || error.message },
                null,
                2
            )
        );
        return {};
    }
};
