import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
import { storeEmailInSupabase } from './supabase.js';
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SPRING_FESTIVAL_EVENT_ID = 'ev_4644551';
const QUESTION_TEXT = "Which event at the Spring Retail Festival are you attending?";
const TARGET_EVENT = "Social Media Masters";
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";


const companyWithCode = [{ key: 'Checkoutchamp', value: '34331000' },
{ key: 'Dash Social', value: '34332000' },
{ key: 'PULSAR', value: '34333000' },
{ key: 'Metricool', value: '34355000' }]


const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1743162842566",
      bundleId: "u7KpSiKT0MtZ2z4JccWS",
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
      console.log(`⚠️ [Try ${attempt}] API responded with failure:`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ [Try ${attempt}] Error pushing transformed order:`, error.response?.data || error.message);
    return false;
  }
};

const transformSocialMediaOrders = (orders) => {
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

    const whichTracks = findAnswer("Which tracks at RMX are you most interested to attend")
      .split(",")
      .map(track => track.trim())
      .filter(track => track);

    const preEventDinner = normalizeYesNo(findAnswer("I would like to be considered to attend the pre-event dinner"));
    const attendRMXAwards = normalizeYesNo(findAnswer("I would like to attend the RMX Awards"));
    const accessRetailX = normalizeYesNo(findAnswer("I would like access to the RetailX Intelligence data platform (free trial)"));
    const linkedinProfile = findAnswer("Linkedin Profile");
    const countryRegion = findAnswer("Country / Region");

    let filteredDynamicFields = customQuestions.map(question => ({
      Name: question.question.replace(/\s+/g, ''),
      Value: normalizeYesNo(question.answer || ""),
      Label: question.question,
      Type: Array.isArray(question.answer) ? "multiselect" : "text"
    })).filter(field =>
      field.Name !== "Typeoftickets" && field.Name !== "repeatemail"
    );

    // Set to track existing field names
    const existingFields = new Set(filteredDynamicFields.map(f => f.Name));

    // Function to add fields only if they don't already exist
    const addField = (name, value, label, type) => {
      if (!existingFields.has(name)) {
        filteredDynamicFields.push({ Name: name, Value: value, Label: label, Type: type });
        existingFields.add(name);
      }
    };

    // Add extra fields only if they don't already exist
    addField("AddressLine1", order.buyer_details?.address?.address_1 || "", "Address Line 1", "text");
    addField("AddressLine2", order.buyer_details?.address?.address_2 || "", "Address Line 2", "text");
    addField("AddressLine3", order.buyer_details?.address?.address_3 || "", "Address Line 3", "text");
    addField("LinkedinProfile", linkedinProfile, "Linkedin Profile", "text");
    addField("Country/Region", countryRegion, "Country / Region", "text");
    addField("WhichtracksatRMXareyoumostinterestedtoattend", whichTracks, "Which tracks at RMX are you most interested to attend", "multiselect");
    addField("Iwouldliketobeconsideredtoattendthepre-eventdinner", preEventDinner, "I would like to be considered to attend the pre-event dinner", "select");
    addField("IwouldliketoattendtheRMXAwards", attendRMXAwards, "I would like to attend the RMX Awards", "select");
    addField("IwouldlikeaccesstotheRetailXIntelligencedataplatform(freetrial)", accessRetailX, "I would like access to the RetailX Intelligence data platform (free trial)", "select");

    const Company = findAnswer("Company/Organisation");
    const Designation = findAnswer("Job title");

    const description =
      order.issued_tickets?.[0]?.description ||
      order.line_items?.[0]?.description ||
      "";

    const lowerDescription = description.toLowerCase();

    let registrationType = {
      ColorCode: "#000",
      RegistrationType: "Supplier/Vendor/Agency Tech/Consultant (RMX Report included with pass)",
      RegistrationTypeId: "yvY8aVrF1PF2bfkLZIJ4"
    };

    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "aBBEc9n1nwFuguN9i7LD"
      }
    } else if (lowerDescription.includes("sponsor")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "LXGs4IOLckXt9j04eUMJ"
      }
    } else if (lowerDescription.includes("speaker")) {
      registrationType = {
        "ColorCode": "#000",
        "RegistrationType": "Speaker",
        "RegistrationTypeId": "Qs28qtCkv9lhnPDNfthX"
      }
    }

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
  });
};

export const fetchSocialMediaMastersOrders = async () => {
  let allOrders = [];
  let nextCursor = null;

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

    console.log(`✅ Fetched ${allOrders.length} total orders`);

    const subscriptionXOrders = allOrders.filter(order => {
      const questions = order.buyer_details?.custom_questions || [];
      return questions.some(q =>
        q.question?.includes(QUESTION_TEXT) &&
        q.answer?.includes(TARGET_EVENT)
      );
    });

    const transformedOrders = transformSocialMediaOrders(subscriptionXOrders);

    const finalOrders = transformedOrders.map(order => {
      if (order.RegistrationType?.RegistrationType === "Sponsor") {
        const companyField = order.DynamicFields.find(
          field => field.Name === "Company/Organisation" ||
            field.Label === "Company/Organisation"
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

    // const ordersWithoutQr = finalOrders.filter(order => !order.qr_code);

    // const emailsWithoutQr = ordersWithoutQr.map(order => order.Email);

    // if (emailsWithoutQr.length > 0) {
    //   fs.writeFileSync(
    //     "emails_without_qr.json",
    //     JSON.stringify({
    //       count: emailsWithoutQr.length,
    //       emails: emailsWithoutQr
    //     }, null, 2)
    //   );
    //   console.log(`📝 Saved ${emailsWithoutQr.length} emails without QR codes to emails_without_qr.json`);
    // } else {
    //   console.log(`✅ All orders have QR codes`);
    // }

    let successCount = 0;
    let failCount = 0;

    for (const order of finalOrders) {
      console.log(`📦 Checking: ${order.FirstName} ${order.LastName} | ${order.Email} | QR: ${order.qr_code}`);

      const stored = await storeEmailInSupabase('social_media_masters', order.Email);

      if (!stored) {
        console.log(`⏩ Skipping push for duplicate email: ${order.Email}`);
        continue; // don't push if duplicate
      }

      console.log(`📤 Pushing: ${order.FirstName} ${order.LastName} | ${order.Email}`);
      await pushTransformedOrder(order, 1);

      await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting
    }

    console.log(`✅ Successfully pushed: ${successCount}`);
    console.log(`❌ Failed to push: ${failCount}`);
    console.log(`📊 Total attempted: ${successCount + failCount}`);

    // fs.writeFileSync(
    //   "SOCIAL_MEDIA_MASTERS.json",
    //   JSON.stringify({
    //     event: TARGET_EVENT,
    //     total: finalOrders.length,
    //     orders: finalOrders
    //   }, null, 2)
    // );

    console.log(`✅ Saved ${finalOrders.length} transformed Subscription orders`);
    return finalOrders;

  } catch (error) {
    console.error("❌ Error:", error.message);
    fs.writeFileSync(
      "subscriptionx_orders_error.json",
      JSON.stringify({ error: error.message }, null, 2)
    );
    return [];
  }
};
