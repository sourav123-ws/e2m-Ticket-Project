import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { checkEmailExists, logE2MError, storeEmailInSupabase } from "../supabase.js";
dotenv.config();

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL;
const AUTH_TOKEN =
  "Basic c2tfOTEzN18yNDE0NzdfZjUwYmJiNGYwZDI2MGFhMjQ3YWZjZGJhZDQ3MWE2N2M=";
const MAD_WORLD_EVENT_ID = "ev_5929701";
const E2M_EVENT_ID = "E1753776477925";
const REGISTRATION_API_URL =
  "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [
  { key: "Benifex", value: "36490000" },
  { key: "Web MD Health Services", value: "36491000" },
  { key: "Lockton", value: "36802000" },
  { key: "EyeMed", value: "36493000" },
  { key: "Fluid Focus", value: "36494000" },
  { key: "Hedroc", value: "36495000" },
  { key: "HUSSLE", value: "36497000" },
  { key: "ifeel", value: "36498000" },
  { key: "Kyan Health", value: "36499000" },
  { key: "MATCH WARE", value: "36500000" },
  { key: "Personify Health", value: "36501000" },
  { key: "Ripple&Co", value: "36502000" },
  { key: "SiSU Health", value: "36503000" },
  { key: "Smart About Health", value: "36504000" },
  { key: "Superwellness", value: "36505000" },
  { key: "SureScreen Diagnostics", value: "36506000" },
  { key: "Workplace Ear Care", value: "36508000" },
  { key: "Test Sponsor", value: "36651000" },
];

const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1753776477925",
      bundleId: "eqjbzyFug2pYPP2Uv7aH",
    },
    data: [order],
  };

  try {
    const response = await axios.post(REGISTRATION_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data?.status == 0 || response.data?.status == -1.5) {
      console.log(`✅ [Try ${attempt}] Pushed: ${order.Email}`);
      return true;
    } else {
      //supabase error log logic
      await logE2MError({
        tt_event_id: MAD_WORLD_EVENT_ID || null,
        e2m_event_id: E2M_EVENT_ID || null,
        email: order.Email,
        error: response?.data || {},
        status: 0,
        e2m_payload: payload,
      });

      console.error(
        `⚠️ API push failed for: ${order.Email}, skipping Supabase storage`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `❌ [Try ${attempt}] Error pushing transformed order:`,
      error.response?.data || error.message
    );
    return false;
  }
};

const transformMadWorldOrders = (orders) => {
  return orders
    .map((order) => {
      // Define findAnswer function inside the map to access the current order
      const findAnswer = (questionText) => {
        const customQuestions = order.buyer_details?.custom_questions || [];
        const question = customQuestions.find(
          (q) =>
            q.question &&
            q.question.toLowerCase().includes(questionText.toLowerCase())
        );
        return question ? question.answer : null;
      };

      const normalizeYesNo = (value) => {
        if (
          value === "1" ||
          value === 1 ||
          value === true ||
          value === "true" ||
          value === "Yes"
        )
          return "Yes";
        if (
          value === "0" ||
          value === 0 ||
          value === false ||
          value === "false" ||
          value === "No"
        )
          return "No";
        return value;
      };

      // Extract answers from the current order's custom questions
      const preEventDinner = normalizeYesNo(
        findAnswer(
          "I would like to be considered to attend the pre-event dinner"
        )
      );
      const accessRetailX = normalizeYesNo(
        findAnswer(
          "I would like access to the RetailX Intelligence data platform (free trial)"
        )
      );
      const podcastGuest = normalizeYesNo(
        findAnswer(
          "I would you like to be considered as a guest on the event podcast recorded live at the event"
        )
      );
      const linkedinProfile = findAnswer("Linkedin Profile");
      const countryRegion =
        findAnswer("Country / Region") || order.event_summary?.venue?.country; // Use venue country as fallback
      const dietaryRestrictions =
        findAnswer("dietary requirements") ||
        findAnswer("dietary restrictions") ||
        "N/A";
      const Company = findAnswer("Company Name"); // This should now correctly get "MAD World"
      const Designation = findAnswer("Job Title") || findAnswer("Job title"); // This should get "Senior Account Director"
      const connectProgram = findAnswer(
        'I agree to participation in the introductory meeting programme "Connect" in a networking break'
      );
      const channelXTrack = findAnswer(
        "If attending ChannelX, which track are you most interested to attend?"
      );
      const termsAgreement =
        normalizeYesNo(
          findAnswer("I agree to the Registration Terms and Conditions")
        ) || normalizeYesNo(findAnswer("T&C"));
      const eventsInterested = findAnswer(
        "Which of the events are you most interested in attending? (Your attendance includes a free copy of the relevant report)?"
      );
      const retailerOrBrand = findAnswer("Are you are Retailer or a Brand?");
      const sector = findAnswer("What sector are you in?");

      let registrationType = {
        ColorCode: "#000",
        RegistrationType: "Attendee",
        RegistrationTypeId: "UOjGBfcFWV3rkRMZfDa5",
      };

      if (registrationType) {
        // Initialize filteredDynamicFields properly
        let filteredDynamicFields = [];

        // Create dynamic fields from custom questions
        const customQuestions = order.buyer_details?.custom_questions || [];
        filteredDynamicFields = customQuestions.map((question) => ({
          Name: question.question.replace(/\s+/g, "").replace(/[^\w]/g, ""),
          Value: normalizeYesNo(question.answer || ""),
          Label: question.question,
          Type: Array.isArray(question.answer) ? "multiselect" : "text",
        }));

        const allowedFields = [
          "Typeoftickets",
          "RepeatEmail",
          "AddressLine2",
          "AddressLine3",
          "Postcode",
          "LinkedinProfile",
          "CountryRegion",
          "Pleaseconfirmifyouhaveanydietaryrestrictionswritenaifnothingapplies",
          "Iwouldliketobeconsideredtoattendthepreeventdinner",
          "IwouldlikeaccesstotheRetailXIntelligencedataplatformfreetrial",
          "Iwouldyouliketobeconsideredasaguestontheeventpodcastrecordedliveattheevent",
          "IagreetoparticipationintheintroductorymeetingprogrammeConnectinanetworkingbreak",
          "IfattendingChannelXwhichtrackareyoumostinterestedtoattend",
          "IagreetotheTCsofregistrationincludingreceivingafreecopyoftherelevantresearchreport",
          "Whichoftheeventsareyoumostinterestedinattendingattendanceincludesafreecopyoftherelevantreport",
          "AreyouareRetaileroraBrand",
          "Whatsectorareyouin",
          "CompanyName",
          "JobTitle",
          "IagreetotheRegistrationTermsandConditions",
          "Doyouhaveanydietaryrequirementsoraccessibilityrequests",
        ];

        filteredDynamicFields = filteredDynamicFields.filter((field) =>
          allowedFields.includes(field.Name)
        );

        const existingFieldNames = filteredDynamicFields.map((f) => f.Name);

        if (!existingFieldNames.includes("Typeoftickets")) {
          filteredDynamicFields.unshift({
            Name: "Typeoftickets",
            Value: "Retailer/Brand/Marketplace",
            Label: "Type of tickets",
            Type: "select",
          });
        }

        const ensureFieldExists = (name, value, label, type) => {
          if (!existingFieldNames.includes(name)) {
            filteredDynamicFields.push({
              Name: name,
              Value: value,
              Label: label,
              Type: type,
            });
          }
        };

        ensureFieldExists("RepeatEmail", null, "Repeat Email", "email");
        ensureFieldExists(
          "AddressLine2",
          order.buyer_details?.address?.address_2 || null,
          "Address Line 2",
          "text"
        );
        ensureFieldExists(
          "AddressLine3",
          order.buyer_details?.address?.address_3 || null,
          "Address Line 3",
          "text"
        );
        ensureFieldExists(
          "CountryRegion",
          countryRegion,
          "Country / Region",
          "text"
        );
        ensureFieldExists(
          "LinkedinProfile",
          linkedinProfile || "www",
          "Linkedin Profile",
          "text"
        );
        ensureFieldExists(
          "Iwouldliketobeconsideredtoattendthepreeventdinner",
          preEventDinner || "No",
          "I would like to be considered to attend the pre-event dinner",
          "select"
        );
        ensureFieldExists(
          "Iwouldyouliketobeconsideredasaguestontheeventpodcastrecordedliveattheevent",
          podcastGuest || "Yes",
          "I would you like to be considered as a guest on the event podcast recorded live at the event",
          "select"
        );
        ensureFieldExists(
          "Pleaseconfirmifyouhaveanydietaryrestrictionswritenaifnothingapplies",
          dietaryRestrictions === "N/A" ? null : dietaryRestrictions,
          "Please confirm if you have any dietary restrictions? (write NA if nothing applies)",
          "text"
        );
        ensureFieldExists(
          "IwouldlikeaccesstotheRetailXIntelligencedataplatformfreetrial",
          accessRetailX || "Yes",
          "I would like access to the RetailX Intelligence data platform (free trial)",
          "select"
        );
        ensureFieldExists(
          "IagreetoparticipationintheintroductorymeetingprogrammeConnectinanetworkingbreak",
          connectProgram === "Yes" || connectProgram === true,
          'I agree to participation in the introductory meeting programme "Connect" in a networking break',
          "checkbox"
        );
        ensureFieldExists(
          "IfattendingChannelXwhichtrackareyoumostinterestedtoattend",
          channelXTrack || "Marketplace Operations",
          "If attending ChannelX, which track are you most interested to attend?",
          "radio"
        );
        ensureFieldExists(
          "IagreetotheTCsofregistrationincludingreceivingafreecopyoftherelevantresearchreport",
          termsAgreement || "Yes",
          "I agree to the T&C's of registration including receiving a free copy of the relevant research report",
          "select"
        );
        ensureFieldExists(
          "Whichoftheeventsareyoumostinterestedinattendingattendanceincludesafreecopyoftherelevantreport",
          Array.isArray(eventsInterested)
            ? eventsInterested
            : eventsInterested
            ? [eventsInterested]
            : ["MAD World Summit"],
          "Which of the events are you most interested in attending? (Your attendance includes a free copy of the relevant report)? ",
          "multiselect"
        );
        ensureFieldExists(
          "AreyouareRetaileroraBrand",
          Array.isArray(retailerOrBrand)
            ? retailerOrBrand
            : retailerOrBrand
            ? [retailerOrBrand]
            : ["Brand"],
          "Are you are Retailer or a Brand? ",
          "multiselect"
        );
        ensureFieldExists(
          "Whatsectorareyouin",
          Array.isArray(sector) ? sector : sector ? [sector] : ["Events"],
          "What sector are you in? ",
          "multiselect"
        );

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
          PhoneCountryCode: order.buyer_details?.phone_country_code || "GB",
          Phone: order.buyer_details?.phone || "",
          Address: order.buyer_details?.address?.address_1 || "",
          Zip: order.buyer_details?.address?.postal_code || "",
          qr_code: order.issued_tickets?.[0]?.barcode || "",
          qr: order.issued_tickets?.[0]?.qr_code_url || "",
          Company: Company || "MAD World", // This should now correctly show "MAD World"
          Designation: Designation || "Senior Account Director", // This should show the job title
          isComplete: true,
        };
      }
    })
    .filter((order) => order !== undefined); // Filter out any undefined orders
};

export const fetchMadWorldOrdersForEv_5929701 = async () => {
  let allOrders = [];
  let nextCursor = null;

  try {
    while (true) {
      let url = `${API_URL}?event_id=${MAD_WORLD_EVENT_ID}`;
      if (nextCursor) url += `&starting_after=${nextCursor}`;

      const response = await axios.get(url, {
        headers: { Authorization: AUTH_TOKEN },
      });

      if (!response.data.data || response.data.data.length === 0) break;
      console.log("Response data:", response.data); // Debugging line

      const orders = response.data.data;
      const validOrders = orders.filter(
        (order) => order && order.status !== "cancelled"
      );

      allOrders.push(...validOrders);
      if (orders.length < 100) break;
      nextCursor = orders[orders.length - 1].id;
    }

    console.log(`✅ Fetched and saved ${allOrders.length} total orders`);

    const transformedOrders = transformMadWorldOrders(allOrders);

    const finalOrders = transformedOrders.map((order) => {
      if (
        order &&
        order.RegistrationType &&
        order.RegistrationType?.RegistrationType === "Sponsor"
      ) {
        const companyField = order.DynamicFields.find(
          (field) =>
            field.Name === "Company/Organisation" ||
            field.Label === "Company/Organisation"
        );
        if (companyField?.Value) {
          const normalize = (str) =>
            str
              ?.toLowerCase()
              .replace(/\s+/g, "")
              .replace(/[^a-z0-9]/gi, "") || "";

          const companyName = normalize(companyField.Value);

          const companyMatch = companyWithCode.find((company) => {
            const normalizedKey = normalize(company.key);
            return (
              companyName.includes(normalizedKey) ||
              normalizedKey.includes(companyName)
            );
          });

          if (companyMatch) {
            return {
              ...order,
              RegistrationType: {
                ...order.RegistrationType,
                RegistrationTypeEntityId: companyMatch.value,
              },
            };
          }
        }
      }
      return order;
    });

    let successCount = 0;
    let failCount = 0;

    // Collect all processed orders
    const processedOrders = [];

    for (const order of finalOrders) {
      if (order) {
        console.log(
          `📦 Checking: ${order.FirstName} ${order.LastName} | ${order.Email} | QR: ${order.qr_code}`
        );
        //checking function here
        // if found no action taken

        const emailExist = await checkEmailExists(
          "mad_world",
          order.Email
        );

        if (emailExist) {
          console.log(
            "Email already exists in Supabase, skipping:",
            order.Email
          );
          continue;
        }

        console.log(
          `📤 Pushing to API: ${order.FirstName} ${order.LastName} | ${order.Email}`
        );
        const pushSuccess = await pushTransformedOrder(order, 1);
        console.log("Push success:", pushSuccess);
        if (pushSuccess) {
          // Only store in Supabase if API push was successful
          const tableName = "mad_world"; // real table name
          console.log(
            `✅ API push successful, storing in Supabase: ${order.Email}`
          );
          const stored = await storeEmailInSupabase(tableName, order.Email);

          if (stored) {
            console.log(`✅ Successfully stored in Supabase: ${order.Email}`);
            successCount++;
          } else {
            console.log(
              `⚠️ API succeeded but Supabase storage failed (duplicate): ${order.Email}`
            );
            successCount++; // Still count as success since API push worked
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // rate limiting
      }
    }

    console.log(`✅ Successfully pushed: ${successCount}`);
    console.log(`❌ Failed to push: ${failCount}`);
    console.log(`📊 Total attempted: ${successCount + failCount}`);

    return finalOrders;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return [];
  }
};
