import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
import { storeAllEmailInSupabase } from './supabase.js';
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const QUESTION_TEXT = "Which event at the Spring Retail Festival are you attending?";
//const TARGET_EVENT = "SustainabilityX";
const ATTENDEE_GET_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mext-prd-get-attendee-list";
const VCARD_UPDATE_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mext-prd-update-vcard";

const eventList = [
  "E1742214690559",
  "E1743162762857",
  "E1743162842566",
  "E1743162911584",
  "E1743163021441",
  "E1743163129042",
  "E1743163201304",
];
const eventConfig = {
  "E1742214690559": {
    companyWithCode: [
      { key: 'Criteo', value: '34050000' },
      { key: 'dunnhumby', value: '34051000' },
      { key: 'monday.com', value: '34052000' },
      { key: 'Stratacache', value: '34053000' },
      { key: 'Koddi', value: '34054000' },
      { key: 'Epsilon', value: '34055000' },
      { key: 'Mirakl', value: '34056000' },
      { key: 'StackAdapt', value: '34057000' },
      { key: 'myAthena', value: '34058000' },
      { key: 'Zeotap', value: '34059000' },
      { key: 'Kenshoo Skai', value: '34060000' },
      { key: 'Sovendus', value: '34061000' },
      { key: 'Dentsu', value: '34062000' },
      { key: 'Commerce Media Tech', value: '34063000' },
      { key: 'Zitcha', value: '34064000' },
      { key: 'SAVI', value: '34065000' },
      { key: 'Mediarithmics', value: '34066000' },
      { key: 'VTEX', value: '34067000' },
      { key: 'Imagino', value: '34068000' },
      { key: 'Tealium', value: '34069000' },
      { key: 'ADvendio', value: '34070000' },
      { key: 'Web Spiders Group', value: '34071000' },
      { key: 'Kevel', value: '34072000' },
      { key: 'Broadsign', value: '34073000' },
      { key: 'Matcha', value: '34074000' },
      { key: 'Flow Living', value: '34075000' },
      { key: 'Osmos', value: '34076000' },
      { key: 'SMG', value: '34077000' },
      { key: 'Webloyalty', value: '34078000' },
      { key: 'RetailX', value: '34079000' },
      { key: 'Women in Retail Media', value: '34080000' },
      { key: 'DPAA', value: '34081000' },
      { key: 'FMCG Guys', value: '34082000' },
      { key: 'IAB Europe', value: '34083000' }
    ],
    registrationType: {
      ColorCode: "#000",
      RegistrationType: "Attendee",
      RegistrationTypeId: "93oKUM9lfuq1KmljRC0D"
    },
    TARGET_EVENT: "Retail MediaX",
    TT_EVENT_ID: "ev_4519856",
    QUESTION_TEXT: "",
  },
  "E1743162762857": {
    companyWithCode: [
      { key: 'Ecommerce Intelligence', value: '34313000' },
      { key: 'Exertis Supply Chain', value: '34314000' },
      { key: 'Smart Scout', value: '34315000' },
      { key: 'Pattern', value: '34316000' },
      { key: 'WORLDFIRST', value: '34317000' },
      { key: 'Carbon6', value: '34318000' },
      { key: 'Channel Engine', value: '34319000' },
      { key: 'Ecommtent', value: '34320000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "r2N1DHJ0QGU3HKSPZkgu"
    },
    TARGET_EVENT: "Amazon Sellers Summit",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
  "E1743162842566": {
    companyWithCode: [
      { key: 'Checkoutchamp', value: '34331000' },
      { key: 'Dash Social', value: '34332000' },
      { key: 'PULSAR', value: '34333000' },
      { key: 'Metricool', value: '34355000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "aBBEc9n1nwFuguN9i7LD"
    },
    TARGET_EVENT: "Social Media Masters",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
  "E1743162911584": {
    companyWithCode: [
      { key: 'SpiderX', value: '34670000' },
      { key: 'Emarsys', value: '34671000' },
      { key: 'Adobe', value: '34672000' },
      { key: 'Imagino CNX', value: '34673000' },
      { key: 'RetailX', value: '34674000' },
      { key: 'FUTR', value: '34675000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "IDcDKMY6E6l9z2Ad394v"
    },
    TARGET_EVENT: "SustainabilityX",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
  "E1743163021441": {
    companyWithCode: [
      { key: 'SpiderX', value: '34670000' },
      { key: 'Emarsys', value: '34671000' },
      { key: 'Adobe', value: '34672000' },
      { key: 'Imagino CNX', value: '34673000' },
      { key: 'RetailX', value: '34674000' },
      { key: 'FUTR', value: '34675000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "oaWbWfKB0q3rJzrvenrT"
    },
    TARGET_EVENT: "CustomerX",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
  "E1743163129042": {
    companyWithCode: [
      { key: 'Anicca Digital', value: '34321000' },
      { key: 'Viamo', value: '34322000' },
      { key: 'Amplience', value: '34323000' },
      { key: 'Post Nord', value: '34324000' },
      { key: 'Smarter Ecommerce', value: '34325000' },
      { key: 'Commerce Media Tech', value: '34326000' },
      { key: 'SPIDERX', value: '34327000' },
      { key: 'Revlifler', value: '34328000' },
      { key: 'Optimizely', value: '34329000' },
      { key: 'Checkoutchamp', value: '34330000' },
      { key: 'Azoma', value: '34678000' },
      { key: 'Epsilon', value: '34679000' },
      { key: 'RetailX', value: '34680000' },
      { key: 'FUTR', value: '34681000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "O3xV8xvdYNk5heJHSiyd"
    },
    TARGET_EVENT: "Digital Marketing Evolution",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
  "E1743163201304": {
    companyWithCode: [
      { key: 'Chargebee', value: '34337000' },
      { key: 'Advantage', value: '34338000' },
      { key: 'Bento Tech', value: '34339000' },
      { key: 'Ordergroove', value: '34340000' },
      { key: 'Recharge', value: '34341000' },
      { key: 'Butter payments', value: '34342000' },
      { key: 'Orchestra Solutions', value: '34344000' },
      { key: 'Adyen', value: '34345000' },
      { key: 'Sovendus', value: '34346000' },
      { key: 'Recurly', value: '34347000' },
      { key: 'Webloyalty', value: '34348000' },
      { key: 'BLUEFORT', value: '34349000' },
      { key: 'ATLAS', value: '34350000' },
      { key: 'WORLD PAY', value: '34351000' },
      { key: 'Churned', value: '34352000' },
      { key: 'RetalX Intellegence', value: '34353000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "uUT8CeS4FPNMdWAfHMK0"
    },
    TARGET_EVENT: "SubscriptionX",
    TT_EVENT_ID: "ev_4644551",
    QUESTION_TEXT: "Which event at the Spring Retail Festival are you attending?",
  },
};

// const companyWithCode = [{ key: 'SpiderX', value: '34670000' },
// { key: 'Emarsys', value: '34671000' },
// { key: 'Adobe', value: '34672000' },
// { key: 'Imagino CNX', value: '34673000' },
// { key: 'RetailX', value: '34674000' },
// { key: 'FUTR', value: '34675000' }]

const getAttendees = async (event_id) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: event_id,
    },
    "data": {
      // "attendeeId": "221000",
      // "attendeeId": "99934031",
      // "attendeeId": "99935226",
      // "attendeeId": "99935054",
      "fields": [
        "AttendeeId",
        "Email",
        "VCard"
      ]
    },
  };

  try {
    const response = await axios.post(ATTENDEE_GET_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data?.status == 0) {
      // console.log(response.data.result.length);
      // console.log(response.data.result);
      // console.log(response.data.result[0].VCard);
      return response.data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.log(`Error in getAttendees:`, error.response?.data || error.message);
    return false;
  }
};

const updateVCards = async (orders, event_id) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      // eventId: "E1743162911584",
      eventId: event_id,
    },
    data: orders,
  };
  console.log("updateVCards payload", payload);
  try {
    const response = await axios.post(VCARD_UPDATE_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.data)
    if (response.data?.status == 0) {
      console.log(`VCard Updated successfully`);
      return true;
    } else {
      console.log(`⚠️ [API responded with failure:`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ [Try Error updating VCard order:`, error.response?.data || error.message);
    return false;
  }
};

const transformOrders = (orders, event_id) => {
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

    let regFlag = false;

    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("staff") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency")) {
      regFlag = true;
    } else if (lowerDescription.includes("sponsor")) {
      regFlag = true;
    } else if (lowerDescription.includes("speaker")) {
      regFlag = true;
    }

    if (regFlag) {
      return {
        Email: order.buyer_details?.email || "",
        qr_code: order.issued_tickets?.[0]?.barcode || "",
        qr_code_url: order.issued_tickets?.[0]?.qr_code_url || "",
      };
    }
    // else {
    //   return null
    // }
  });
};

export const fetchOrders = async () => {
  console.log("Fetching orders...");
  try {
    //---------------------------
    for (let i = 0; i < eventList.length; i++) {
      const eventId = eventList[i];
      const { companyWithCode } = eventConfig[eventId];
      let eventAttendees = await getAttendees(eventId);
      if (eventAttendees.length == 0) {
        console.log(`No attendees found for event ID: ${eventId}`);
        return [];
      } else {
        console.log(`e2m - Event ID: ${eventId}; Attendees: ${eventAttendees.length}`);
        // console.log("eventAttendees", eventAttendees);
      }
      let allOrders = [];
      let nextCursor = null;
      while (true) {
        let url = `${API_URL}?event_id=${eventConfig[eventId].TT_EVENT_ID}`;
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

      console.log(`TT Registrations: ${allOrders.length}`);

      // const userEmail = "01.mrunal@gmail.com";
      // const userEmail = "jessica.cooke@stonegategroup.co.uk";
      // const userEmail = "bartosz.bielecki@cm.tech";
      // const userEmail = "starfilemedia@aol.com";
      // const userEmail = "bethany.butt@screwfix.com";
      // const userEmail = "bartosz.bielecki@cm.tech";
      // const userEmail = "kerry@joolz.com";
      // const userEmail = "ed@hanaco.ltd.uk";
      // const userEmail = "jamesrigg@buyitdirect.co.uk";
      // const userEmail = "andy.james@internetretailing.net";
      const subscriptionXOrders = allOrders.filter(order => {
        const questions = order.buyer_details?.custom_questions || [];

        return questions.some(q =>
          !eventConfig[eventId].QUESTION_TEXT || q.question?.includes(eventConfig[eventId].QUESTION_TEXT)
          // &&
          // // q.answer?.includes(TARGET_EVENT) &&
          // order.buyer_details?.email == userEmail
        );
      });
      try {
        const transformedOrders = transformOrders(subscriptionXOrders, eventId);
        // if (transformedOrders.length == 1) {
        //   console.log("transformedOrders?????????????????????????????????????????????????????????????????????????????", transformedOrders);
        //   // return [];
        // } else {
        //   console.log("transformedOrders>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", transformedOrders);
        //   // return [];
        // }
        let attendeeUpdates = [];
        for (let i = 0; i < transformedOrders.length; i++) {
          const order = transformedOrders[i];
          if (!order) continue;
          for (let j = 0; j < eventAttendees.length; j++) {
            if (order.Email == eventAttendees[j].Email) {
              // console.log("order.qr_code : ", order.qr_code);
              // console.log("eventAttendees[j].EXT_QRCODE : ", eventAttendees[j].VCard.EXT_QRCODE);
              if (!eventAttendees[j].VCard || order.qr_code != eventAttendees[j].VCard.EXT_QRCODE) {
                const attendee = {
                  // "Email": eventAttendees[j].Email,
                  "AttendeeId": eventAttendees[j].AttendeeId,
                  "VCard": {
                    "EXT_QR": order.qr_code_url,
                    "QR": order.qr_code_url,
                    "EXT_QRCODE": order.qr_code,
                  }
                };
                attendeeUpdates.push(attendee);
                break;
              }
            }
          }
        }

        console.log("VCard Changed: ", attendeeUpdates.length);
        // console.log("VCard Changed: ", attendeeUpdates);

        // if (transformedOrders.length == 1) {
        //   return [];
        // } else {
        //   return [];
        // }
        if (attendeeUpdates.length == 0) {
          console.log("No VCard changes found");
          return [];
        } else {
          await updateVCards(attendeeUpdates, eventId);
        }

        // for (const order of attendeeUpdates) {
        //   await updateVCards(order, eventId);
        //   // await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting
        // }

        // console.log(`✅ Saved ${finalOrders.length} transformed Subscription orders`);
        // console.log(`✅ Successfully pushed: ${successCount}`);
        // console.log(`❌ Failed to push: ${failCount}`);
        // console.log(`📊 Total attempted: ${successCount + failCount}`);
      } catch (error) {
        console.error("❌ Error:", error.message);
        // fs.writeFileSync(
        //   "subscriptionx_orders_error.json",
        //   JSON.stringify({ error: error.message }, null, 2)
        // );
      }
    }
    //---------------------------

    //return finalOrders;

  } catch (error) {
    console.error("❌ Error:", error.message);
    fs.writeFileSync(
      "subscriptionx_orders_error.json",
      JSON.stringify({ error: error.message }, null, 2)
    );
  }
  return [];
};

fetchOrders()
