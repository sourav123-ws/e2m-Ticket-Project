import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import { storeEmailInSupabase } from "./supabase.js";
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const RETAILX_EVENT_ID = "ev_4519856";
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [{ key: 'Criteo', value: '34050000' },
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
{ key: 'IAB Europe', value: '34083000' }]

const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1742214690559",
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
      console.warn(`⚠️ [Try ${attempt}] API responded with failure:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Try ${attempt}] Exception while pushing:`, error.response?.data || error.message);
    return false;
  }
};

// const fetchSpringFestivalOrders = async () => {
//   let allOrders = [];
//   let nextCursor = null;

//   try {
//     while (true) {
//       let url = `${API_URL}?event_id=${SPRING_FESTIVAL_EVENT_ID}`;
//       if (nextCursor) {
//         url += `&starting_after=${nextCursor}`;
//       }

//       const response = await axios.get(url, {
//         headers: { Authorization: AUTH_TOKEN },
//       });

//       if (!response.data.data || response.data.data.length === 0) {
//         console.log("✅ No more data to fetch for Spring Festival Event.");
//         break;
//       }

//       const orders = response.data.data;
//       allOrders.push(...orders);

//       if (orders.length < 100) break;

//       nextCursor = orders[orders.length - 1].id;
//     }

//     console.log(`✅ Fetched ${allOrders.length} orders for Spring Festival Event.`);

//     const groupedOrders = {};

//     allOrders.forEach((order, index) => {
//       const customQuestions = order.buyer_details?.custom_questions || [];

//       if (index < 5) {
//         console.log(`🔍 Debugging Order ${index + 1}:`, JSON.stringify(customQuestions, null, 2));
//       }

//       customQuestions.forEach((question) => {
//         const questionText = question?.question?.trim();
//         const answerText = question?.answer?.trim();

//         // console.log(`📌 Checking question: "${questionText}"`);

//         if (!questionText || !answerText) {
//           console.log("⚠️ Skipping: Missing question or answer");
//           return;
//         }

//         if (questionText.toLowerCase().includes(QUESTION_TEXT.toLowerCase())) {
//           // console.log(`✅ Matched question! Answer: "${answerText}"`);

//           if (!groupedOrders[answerText]) {
//             groupedOrders[answerText] = [];
//           }

//           groupedOrders[answerText].push(order);
//         }
//       });
//     });

//     // Save grouped data to file
//     fs.writeFileSync(
//       "spring_festival_grouped_orders.json",
//       JSON.stringify(groupedOrders, null, 2)
//     );

//     // console.log("✅ Data saved to spring_festival_grouped_orders.json");
//     return groupedOrders;
//   } catch (error) {
//     console.log("❌ Error fetching orders:", error.response?.data || error.message);
//     return {};
//   }
// };

// export const fetchRetailXOrders = async (req,res) => {
//   let allOrders = [];
//   let nextCursor = null;

//   try {
//     while (true) {
//       let url = `${API_URL}?event_id=${RETAILX_EVENT_ID}`;
//       if (nextCursor) {
//         url += `&starting_after=${nextCursor}`;
//       }

//       const response = await axios.get(url, {
//         headers: { Authorization: AUTH_TOKEN },
//       });

//       if (!response.data.data || response.data.data.length === 0) {
//         console.log("✅ No more data to fetch for RetailX Event.");
//         break;
//       }

//       const validOrders = response.data.data.filter(order => {
//         return order && order.status && order.status !== "cancelled";
//       });

//       allOrders.push(...validOrders);

//       nextCursor = response.data.data[response.data.data.length - 1].id;

//       if (response.data.data.length < 100) break;
//     }

//     const transformedOrders = transformRetailXOrders(allOrders);

//     // Process orders to add company code for Sponsors
//     const finalOrders = transformedOrders.map(order => {
//       if (order.RegistrationType?.RegistrationType === "Sponsor") {
//         const companyField = order.DynamicFields.find(
//           field => field.Name === "Company/Organisation" || field.Label === "Company/Organisation"
//         );

//         if (companyField) {
//           const companyName = companyField.Value.toLowerCase();
//           const companyMatch = companyWithCode.find(company => 
//             companyName.includes(company.key.toLowerCase()) || 
//             company.key.toLowerCase().includes(companyName)
//           );

//           if (companyMatch) {
//             return {
//               ...order,
//               RegistrationType: {
//                 ...order.RegistrationType,
//                 RegistrationTypeEntityId: companyMatch.value
//               }
//             };
//           }
//         }
//       }
//       return order;
//     });

//     // Push all orders to DB
//     for (const order of finalOrders) {
//       if (!order) {
//         console.warn("⚠️ Skipping undefined order in finalOrders");
//         continue;
//       }
//       await pushTransformedOrder([order]);
//       await new Promise(resolve => setTimeout(resolve, 500));
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Data push completed successfully"
//     });

//   } catch (error) {
//     console.error("❌ Error fetching RetailX orders:", error.stack || error);
//     return [];
//   }
// };


// export const fetchRetailXOrders = async (req, res) => {
//   let allOrders = [];
//   let nextCursor = null;

//   try {
//     // Fetch all paginated data
//     while (true) {
//       let url = `${API_URL}?event_id=${RETAILX_EVENT_ID}`;
//       if (nextCursor) {
//         url += `&starting_after=${nextCursor}`;
//       }

//       const response = await axios.get(url, {
//         headers: { Authorization: AUTH_TOKEN },
//       });

//       const data = response.data?.data || [];

//       if (data.length === 0) {
//         console.log("✅ No more data to fetch for RetailX Event.");
//         break;
//       }

//       // Filter out cancelled orders
//       const validOrders = data.filter(order => order && order.status !== "cancelled");
//       allOrders.push(...validOrders);

//       // Set cursor to last ID
//       nextCursor = data[data.length - 1].id;

//       // Break if less than 100 — no more pages
//       if (data.length < 100) break;
//     }

//     console.log(`🧾 Total fetched valid orders: ${allOrders.length}`);

//     // Transform and enrich
//     const transformedOrders = transformRetailXOrders(allOrders);

//     const finalOrders = transformedOrders.map(order => {
//       if (order.RegistrationType?.RegistrationType === "Sponsor") {
//         const companyField = order.DynamicFields.find(
//           field => field.Name === "Company/Organisation" || field.Label === "Company/Organisation"
//         );

//         if (companyField) {
//           const companyName = companyField.Value?.toLowerCase();
//           const companyMatch = companyWithCode.find(company =>
//             companyName?.includes(company.key.toLowerCase()) ||
//             company.key.toLowerCase().includes(companyName)
//           );

//           if (companyMatch) {
//             return {
//               ...order,
//               RegistrationType: {
//                 ...order.RegistrationType,
//                 RegistrationTypeEntityId: companyMatch.value
//               }
//             };
//           }
//         }
//       }
//       return order;
//     });

//     // ✅ Insert in chunks (faster + no rate limits)
//     const chunkSize = 25;
//     let totalInserted = 0;

//     for (let i = 0; i < finalOrders.length; i += chunkSize) {
//       const chunk = finalOrders.slice(i, i + chunkSize);
//       await pushTransformedOrder(chunk);
//       totalInserted += chunk.length;
//       console.log(`📦 Inserted ${totalInserted}/${finalOrders.length}`);
//       await new Promise(resolve => setTimeout(resolve, 300)); // slight delay to avoid overload
//     }

//     return res.status(200).json({
//       success: true,
//       message: "✅ All RetailX data processed and pushed",
//       count: finalOrders.length,
//       data: finalOrders,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching RetailX orders",
//       error: error.message
//     });
//   }
// };


const transformRetailXOrders = (orders) => {
  return orders.map(order => {
    const customQuestions = order.buyer_details?.custom_questions || [];

    const findAnswer = (questionText) => {
      const match = customQuestions.find(q =>
        q.question.trim().toLowerCase().includes(questionText.toLowerCase().trim())
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

    let registrationType;

    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("staff") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency")) {
      registrationType = {
        ColorCode: "#000",
        RegistrationType: "Attendee",
        RegistrationTypeId: "93oKUM9lfuq1KmljRC0D"
      };
    } else if (lowerDescription.includes("sponsor")) {
      registrationType = {
        ColorCode: "#000",
        RegistrationType: "Sponsor",
        RegistrationTypeId: "rmEBbeNRrSiUc0Em3OAS"
      };
    } else if (lowerDescription.includes("speaker")) {
      registrationType = {
        ColorCode: "#000",
        RegistrationType: "Speaker",
        RegistrationTypeId: "rc35cLMbIdqfTjIoEfoA"
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
        PhoneCountryCode: order.buyer_details?.phone_country_code || "",
        Phone: order.buyer_details?.phone || "",
        Address: order.buyer_details?.address?.address_1 || "",
        Zip: order.buyer_details?.address?.postal_code || "",
        qr_code: order.issued_tickets[0].barcode,
        qr: order.issued_tickets[0].qr_code_url,
        Company: Company,
        Designation: Designation,
        isComplete: true
      };

    }
  });

};



export const fetchRetailXOrders = async (req, res) => {
  let allOrders = [];
  let nextCursor = null;

  try {
    // Fetch paginated data
    while (true) {
      let url = `${API_URL}?event_id=${RETAILX_EVENT_ID}`;
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

    console.log(`🧾 Total fetched valid orders: ${allOrders.length}`);

    const transformedOrders = transformRetailXOrders(allOrders);

    const finalOrders = transformedOrders.map(order => {
      if (order && order.Email == "nichitalobo@gmail.com") {
        console.log("order", order)
      }
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

        const stored = await storeEmailInSupabase('retail_x', order.Email);

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

fetchRetailXOrders();