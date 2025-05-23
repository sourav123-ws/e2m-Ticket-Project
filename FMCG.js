import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import { storeEmailInSupabase } from './supabase.js';
dotenv.config();

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SPRING_FESTIVAL_EVENT_ID = 'ev_4745831';
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [{ key: 'dunnhumby', value: '36186000' },
{ key: 'Numberly', value: '36187000' },
{ key: 'Mirakl', value: '36188000' },
{ key: 'PRN', value: '36189000' },
{ key: 'SAVI', value: '36190000' },
{ key: 'Commerce IQ', value: '36191000' },
{ key: 'Nectar 360', value: '36192000' },
{ key: 'RetailX', value: '36193000' },
{ key: 'FMCG Guys', value: '36194000' }];

const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1747670277539",
      bundleId: "u7KpSiKT0MtZ2z4JccWS",
    },
    data: [order],
  };

  try {
    const response = await axios.post(REGISTRATION_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data?.status == 0) {
      console.log(`✅ [Try ${attempt}] Pushed: ${order.Email}`);
      return true;
    } else {
      console.log(`⚠️ [Try ${attempt}] API responded with failure:`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ [Try ${attempt}] Error pushing transformed order:`, error.response?.data || error.message);
    return false;
  }
};

const transformFMCGOrders = (orders) => {
  return orders.map(order => {
    const customQuestions = order.buyer_details?.custom_questions || [];

    const findAnswer = (questionText) => {
      const match = customQuestions.find(q =>
        q.question?.trim().toLowerCase().includes(questionText.toLowerCase().trim())
      );
      return match?.answer || "";
    };

    const normalizeYesNo = (value) => {
      if (value === "1") return "Yes";
      if (value === "0") return "No";
      return value;
    };

    const preEventDinner = normalizeYesNo(findAnswer("I would like to be considered to attend the pre-event dinner"));
    const accessRetailX = normalizeYesNo(findAnswer("I would like access to the RetailX Intelligence data platform (free trial)"));
    const linkedinProfile = findAnswer("Linkedin Profile");
    const countryRegion = findAnswer("Country / Region");
    const dietaryRestrictions = findAnswer("Confirm dietary restrictions? Write NA if nothing applies.") || "N/A";
    const Company = findAnswer("Company/Organisation");
    const Designation = findAnswer("Job title");

    const description =
      order.issued_tickets?.[0]?.description ||
      order.line_items?.[0]?.description ||
      "";

    const lowerDescription = description.toLowerCase();

    let registrationType;

    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("staff") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency") ||
      lowerDescription.includes("marketplace") ||
      lowerDescription.includes("mediaagency") ||
      lowerDescription.includes("consultant")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "cNQfGmutcDAC5hzStnqZ"
      }
    } else if (lowerDescription.includes("sponsor")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "DgG5hTkMrGQBfmNNsViv"
      }
    } else if (lowerDescription.includes("speaker")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Speaker",
        "RegistrationTypeId": "kyamSq1PIgUr49NdKL3F"
      }
    }

    if (registrationType) {
      let filteredDynamicFields = customQuestions.map(question => ({
        Name: question.question.replace(/\s+/g, ''),
        Value: normalizeYesNo(question.answer || ""),
        Label: question.question,
        Type: Array.isArray(question.answer) ? "multiselect" : "text"
      })).filter(field =>
        field.Name !== "Typeoftickets" && field.Name !== "repeatemail"
      );

      const allowedFields = [
        "Typeoftickets",
        "AddressLine2",
        "AddressLine3",
        "Postcode",
        "LinkedinProfile",
        "Country/Region",
        "Confirmdietaryrestrictions?WriteNAifnothingapplies.",
        "Iwouldliketobeconsideredtoattendthepre-eventdinner",
        "IwouldlikeaccesstotheRetailXIntelligencedataplatform(freetrial)"
      ];

      filteredDynamicFields = filteredDynamicFields.filter(field =>
        allowedFields.includes(field.Name)
      );

      const existingFieldNames = filteredDynamicFields.map(f => f.Name);

      if (!existingFieldNames.includes("Typeoftickets")) {
        filteredDynamicFields.unshift({
          Name: "Typeoftickets",
          Value: registrationType.RegistrationType,
          Label: "Type of tickets",
          Type: "select"
        });
      }

      const ensureFieldExists = (name, value, label, type) => {
        if (!existingFieldNames.includes(name)) {
          filteredDynamicFields.push({
            Name: name,
            Value: value,
            Label: label,
            Type: type
          });
        }
      };

      ensureFieldExists("Company/Organisation", Company, "Company/Organisation", "text");
      ensureFieldExists("AddressLine2", order.buyer_details?.address?.address_2 || "", "Address Line 2", "text");
      ensureFieldExists("AddressLine3", order.buyer_details?.address?.address_3 || "", "Address Line 3", "text");
      ensureFieldExists("Postcode", order.buyer_details?.address?.postal_code || "", "Postcode", "text");
      ensureFieldExists("LinkedinProfile", linkedinProfile, "Linkedin Profile", "text");
      ensureFieldExists("Country/Region", countryRegion, "Country / Region", "text");
      ensureFieldExists("Confirmdietaryrestrictions?WriteNAifnothingapplies.", dietaryRestrictions, "Confirm dietary restrictions? Write NA if nothing applies.", "text");
      ensureFieldExists("Iwouldliketobeconsideredtoattendthepre-eventdinner", preEventDinner, "I would like to be considered to attend the pre-event dinner", "select");
      ensureFieldExists("IwouldlikeaccesstotheRetailXIntelligencedataplatform(freetrial)", accessRetailX, "I would like access to the RetailX Intelligence data platform (free trial)", "select");

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
        PhoneCountryCode: order.buyer_details?.phone_country_code || "",
        Phone: order.buyer_details?.phone || "",
        Address: order.buyer_details?.address?.address_1 || "",
        Zip: order.buyer_details?.address?.postal_code || "",
        qr_code: order.issued_tickets?.[0]?.barcode || "",
        qr: order.issued_tickets?.[0]?.qr_code_url || "",
        Company: Company,
        Designation: Designation,
        isComplete: true
      };
    }
  });
};

export const fetchFMCGOrders = async () => {
  let allOrders = [];
  let nextCursor = null;

  // // Create directory for raw orders if it doesn't exist
  // const outputDir = path.join(__dirname, 'raw_orders');
  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir, { recursive: true });
  //   console.log(`📁 Created directory: ${outputDir}`);
  // }

  try {
    while (true) {
      let url = `${API_URL}?event_id=${SPRING_FESTIVAL_EVENT_ID}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      if (!response.data.data || response.data.data.length === 0) break;

      const orders = response.data.data;
      const validOrders = orders.filter(order => order && order.status !== "cancelled");

      allOrders.push(...validOrders);
      if (orders.length < 100) break;
      nextCursor = orders[orders.length - 1].id;
    }

    console.log(`✅ Fetched and saved ${allOrders.length} total orders`);

    const transformedOrders = transformFMCGOrders(allOrders);

    const finalOrders = transformedOrders.map(order => {
      if (order && order.RegistrationType && order.RegistrationType?.RegistrationType === "Sponsor") {
        const companyField = order.DynamicFields.find(
          field => field.Name === "Company/Organisation" ||
            field.Label === "Company/Organisation"
        );
        if (companyField?.Value) {

          const normalize = str =>
            str?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') || '';

          const companyName = normalize(companyField.Value);

          const companyMatch = companyWithCode.find(company => {
            const normalizedKey = normalize(company.key);
            return companyName.includes(normalizedKey) || normalizedKey.includes(companyName);
          });

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

    let successCount = 0;
    let failCount = 0;

    // Collect all orders in an array
    const Orders = [];

    for (const order of finalOrders) {
      if (order) {
        console.log(`📦 Checking: ${order.FirstName} ${order.LastName} | ${order.Email} | QR: ${order.qr_code}`);

        const stored = await storeEmailInSupabase('fmcg', order.Email);

        if (!stored) {
          console.log(`⏩ Skipping push for duplicate email: ${order.Email}`);
          continue; // don't push if duplicate
        }

        console.log(`📤 Pushing: ${order.FirstName} ${order.LastName} | ${order.Email}`);
        await pushTransformedOrder(order, 1);

        await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting
      }
    }

    // Write all orders to a JSON file after the loop
    // fs.writeFileSync('orders.json', JSON.stringify(Orders, null, 2));

    console.log(`✅ Successfully processed ${successCount} orders, failed ${failCount} orders.`);

    console.log(`✅ Successfully pushed: ${successCount}`);
    console.log(`❌ Failed to push: ${failCount}`);
    console.log(`📊 Total attempted: ${successCount + failCount}`);
    return finalOrders;

  } catch (error) {
    console.error("❌ Error:", error.message);
    // fs.writeFileSync(
    //   path.join(outputDir, "subscriptionx_orders_error.json"),
    //   JSON.stringify({ error: error.message }, null, 2)
    // );
    return [];
  }
};
