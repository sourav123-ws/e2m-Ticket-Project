import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import { storeEmailInSupabase } from "../supabase.js";
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const RETAILX_BRIEF_EXECUTIVE_SPEAKER_ATTENDEE = "ev_6320483";
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [{ key: 'AppsFlyer', value: '36455000' },
{ key: 'DPAA', value: '36456000' },
{ key: 'Epsilon', value: '36451000' },
{ key: 'FMCG Guys', value: '36457000' },
{ key: 'IAB Europe', value: '36474000' },
{ key: 'Koddi', value: '36452000' },
{ key: 'LiverRamp', value: '36448000' },
{ key: 'Mirakl', value: '36453000' },
{ key: 'STRATACACHE', value: '36449000' },
{ key: 'dunnhumby', value: '36450000' }];

const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1753774391797",
      bundleId: "0daKFcWSqH9r6GpFzoOn",
    },
    data: [order],
  };


  try {
    const response = await axios.post(REGISTRATION_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data?.success) {
      console.log(`✅ [Try ${attempt}] Pushed: ${order.Email}`);
      return true;
    } else {
      console.warn(`⚠️ [Try ${attempt}] API responded with failure:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Try ${attempt}] Exception while pushing:`, error.response?.data || error.message);
    return false;
  }
};


const transformRetailXOrders = (orders) => {
  return orders.map(order => {
    const customQuestions = order.buyer_details?.custom_questions || [];

    const findAnswer = (questionText) => {
      const match = customQuestions.find(q =>
        q.question.trim().toLowerCase() === questionText.toLowerCase().trim()
      );
      return match?.answer || "";
    };

    // Map Company and Designation from custom questions
    const Company = findAnswer("Company") || findAnswer("Company/Organisation") || "";
    const Designation = findAnswer("Designation") || findAnswer("Job title") || "";

    // Country/Region
    const countryRegion = findAnswer("Country/Region") || findAnswer("Country / Region") || "";

    // Build DynamicFields using the exact label and a normalized name
    let filteredDynamicFields = customQuestions.map(question => ({
      Name: question.question.replace(/\s+/g, '').replace(/[^\w]/g, ''),
      Value: question.answer || "",
      Label: question.question,
      Type: Array.isArray(question.answer) ? "multiselect" : "text"
    }));

    // Add essential fields if missing
    const addField = (name, value, label, type) => {
      if (!filteredDynamicFields.some(f => f.Name === name)) {
        filteredDynamicFields.push({ Name: name, Value: value, Label: label, Type: type });
      }
    };

    addField("CountryRegion", countryRegion, "Country/Region", "text");
    addField("Company", Company, "Company", "text");
    addField("Designation", Designation, "Designation", "text");


    // RegistrationType logic
    const description =
      order.issued_tickets?.[0]?.description ||
      order.line_items?.[0]?.description ||
      "";
    const lowerDescription = description.toLowerCase();

    let registrationType;
    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("brand") ||
      lowerDescription.includes("staff") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency") ||
      lowerDescription.includes("marketplace")) {
        registrationType = {
          ColorCode: "#000",
          RegistrationType: "Attendee",
          RegistrationTypeId: "992EnMfWz3u8ZhJMqx1f"
        };
    } else if (lowerDescription.includes("speaker")) {
      registrationType = {
        ColorCode: "#000",
        RegistrationType: "Speaker",
        RegistrationTypeId: "rXluJHf1SOqWY1w4Mveu",
      };
    }

    if (registrationType) {
      return {
        sendMail: 0,
        ShowInCMSAttendeeList: 1,
        FormType: "FREE",
        RegistrationType: registrationType,
        DynamicFields: filteredDynamicFields,
        DefaultFields: [],
        PreSignupFields: [],
        FirstName: order.buyer_details?.first_name || "",
        LastName: order.buyer_details?.last_name || "",
        Email: order.buyer_details?.email || "",
        Address: order.buyer_details?.address?.address_1 || "",
        Zip: order.buyer_details?.address?.postal_code || "",
        Designation: Designation,
        Company: Company,
        PhoneCountryCode: order.buyer_details?.phone_country_code || "",
        Phone: order.buyer_details?.phone || "",
        qr_code: order.issued_tickets[0].barcode,
        qr: order.issued_tickets[0].qr_code_url,
        isComplete: true
      };
    }
  }).filter(Boolean);
};



export const fetchRetailXExecutiveOrdersForEv_6320483 = async (req, res) => {
  let allOrders = [];
  let nextCursor = null;

  try {
    // Fetch paginated data
    while (true) {
      let url = `${API_URL}?event_id=${RETAILX_BRIEF_EXECUTIVE_SPEAKER_ATTENDEE}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      const data = response.data?.data || [];
      if (data.length === 0) {
        console.log("✅ No more data to fetch for RetailX Event.");
        break;
      }

      const validOrders = data.filter(order => order && order.status !== "cancelled");
      allOrders.push(...validOrders);
      nextCursor = data[data.length - 1].id;
      if (data.length < 100) break;
    }

    // console.log(`🧾 Total fetched valid orders: ${allOrders.length}`);

    const transformedOrders = transformRetailXOrders(allOrders);

    const finalOrders = transformedOrders.map(order => {
      if (order && order.RegistrationType && order.RegistrationType?.RegistrationType === "Sponsor") {
        const companyField = order.DynamicFields.find(
          field => field.Name === "Company/Organisation" || field.Label === "Company/Organisation"
        );

        if (companyField) {
          const companyName = companyField.Value?.toLowerCase();
          const companyMatch = companyWithCode.find(company =>
            companyName?.includes(company.key.toLowerCase()) ||
            company.key.toLowerCase().includes(companyName)
          );

          if (companyMatch) {
            return {
              ...order,
              RegistrationType: {
                ...order.RegistrationType,
                RegistrationTypeEntityId: companyMatch.value
              }
            };
          }
        }
      }
      return order;
    });

    //  const ordersWithoutQr = finalOrders.filter(order => !order.qr_code);

    //     const emailsWithoutQr = ordersWithoutQr.map(order => order.Email);

    //     if (emailsWithoutQr.length > 0) {
    //       fs.writeFileSync(
    //         "emails_without_qr.json",
    //         JSON.stringify({
    //           count: emailsWithoutQr.length,
    //           emails: emailsWithoutQr
    //         }, null, 2)
    //       );
    //       console.log(`📝 Saved ${emailsWithoutQr.length} emails without QR codes to emails_without_qr.json`);
    //     } else {
    //       console.log(`✅ All orders have QR codes`);
    //     }


    let successCount = 0;

    for (const order of finalOrders) {
      if (order) {
        console.log(`📦 Checking: ${order.FirstName} ${order.LastName} | ${order.Email} | QR: ${order.qr_code}`);

        const stored = await storeEmailInSupabase('retailx_brief_executive', order.Email);

        if (!stored) {
          console.log(`⏩ Skipping push for duplicate email: ${order.Email}`);
          continue; // don't push if duplicate
        }

        console.log(`📤 Pushing: ${order.FirstName} ${order.LastName} | ${order.Email}`);
        await pushTransformedOrder(order, 1);

        await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting
      }
    }
    // fs.writeFileSync(
    //       "RETAIL_X.json",
    //       JSON.stringify({
    //         total: transformedOrders.length,
    //         orders: transformedOrders
    //       }, null, 2)
    //     );

    console.log(`✅ Saved ${finalOrders.length} transformed Subscription orders`);
    return finalOrders;

  } catch (error) {
    console.error("❌ Error fetching RetailX orders:", error);
    // return res.status(500).json({
    //   success: false,
    //   message: "Error fetching RetailX orders",
    //   error: error.message
    // });
  }
};
