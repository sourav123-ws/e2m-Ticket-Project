import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import { checkEmailExists, logE2MError, storeEmailInSupabase } from './supabase.js';
dotenv.config();

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const AUTUMN_FESTIVAL_EVENT_ID = 'ev_6286249'; // for attendee registrations
const E2M_EVENT_ID = 'E1753774079219';
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [{ key: 'Addingwell', value: '36481000' },
{ key: 'AppsFlyer', value: '36466000' },
{ key: 'Canto', value: '36476000' },
{ key: 'Carbon6', value: '36461000' },
{ key: 'ChannelEngine', value: '36470000' },
{ key: 'Commerce Media Tech', value: '36472000' },
{ key: 'Imagino', value: '36486000' },
{ key: 'Koddi', value: '36467000' },
{ key: 'Kubb&co', value: '36479000' },
{ key: 'Linnworks', value: '36465000' },
{ key: 'LiverRamp 2', value: '36487000' },
{ key: 'Miarkl', value: '36458000' },
{ key: 'PXP', value: '36485000' },
{ key: 'Pattern', value: '36463000' },
{ key: 'Photoroom', value: '36462000' },
{ key: 'Proptexx', value: '36477000' },
{ key: 'STRATACACHE', value: '36488000' },
{ key: 'Salesforce', value: '36464000' },
{ key: 'Simpler', value: '36511000' },
{ key: 'So Squared', value: '36480000' },
{ key: 'Somerce', value: '36478000' },
{ key: 'Virtual Stock', value: '36460000' },
{ key: 'Webloyalty', value: '36469000' },
{ key: 'WorldFirst', value: '36459000' },
{ key: 'Aria', value: '36484000' }];
 
const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1753774079219",
      bundleId: "XlQa3dSUAWOyrYa9r6z4",
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
    }
    else {
      //supabase error log logic
      await logE2MError({
        tt_event_id: AUTUMN_FESTIVAL_EVENT_ID || null,
        e2m_event_id: E2M_EVENT_ID || null,
        email: order.Email,
        error: response?.data || {},
        status: 0,
        e2m_payload: payload
      });

      console.error(`⚠️ API push failed for: ${order.Email}, skipping Supabase storage`);
      return false;
    }
  } catch (error) {
    console.log(`❌ [Try ${attempt}] Error pushing transformed order:`, error.response?.data || error.message);
    return false;
  }
};

const transformAutumnFestivalAttendee = (orders) => {
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

    const countryRegion = findAnswer("Country / Region");
    const linkedinProfile = findAnswer("Linkedin Profile");
    const preEventDinner = normalizeYesNo(findAnswer("I would like to be considered to attend the pre-event dinner"));
    const eventPodcast = normalizeYesNo(findAnswer("I would you like to be considered as a guest on the event podcast recorded live at the event"));
    const dietaryRestrictions = findAnswer("Please confirm if you have any dietary restrictions? (write NA if nothing applies)") || "N/A";
    const accessRetailX = normalizeYesNo(findAnswer("I would like access to the RetailX Intelligence data platform (free trial)"));
    const agreeConnect = normalizeYesNo(findAnswer("I agree to participation in the introductory meeting programme \"Connect\" in a networking break"));
    const channelXTrack = findAnswer("If attending ChannelX, which track are you most interested to attend?");
    const tcAgree = findAnswer("I agree to the T&C's of registration including receiving a free copy of the relevant research report");
    const interestedEvents = findAnswer("Which of the events are you most interested in attending? (Your attendance includes a free copy of the relevant report)?");
    const retailerOrBrand = findAnswer("Are you are Retailer or a Brand?");
    const sector = findAnswer("What sector are you in?");
    const company = findAnswer("Company/Organisation");
    const designation = findAnswer("Job Title");

    const description =
      order.issued_tickets?.[0]?.description ||
      order.line_items?.[0]?.description ||
      "";
    const lowerDescription = description.toLowerCase();

    let registrationType;

    registrationType = {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "xiCNehTG0M8Hi50oT5ia"
    };

    // if (lowerDescription.includes("brand") ||
    //   lowerDescription.includes("staff") ||
    //   lowerDescription.includes("retailer") ||
    //   lowerDescription.includes("vendor") ||
    //   lowerDescription.includes("agency") ||
    //   lowerDescription.includes("marketplace") ||
    //   lowerDescription.includes("mediaagency") ||
    //   lowerDescription.includes("consultant") || 
    //   lowerDescription.includes("vip")) {
    //   registrationType = {
    //     "ColorCode": "#000",
    //     "RegistrationType": "Attendee",
    //     "RegistrationTypeId": "cNQfGmutcDAC5hzStnqZ"
    //   }
    // } else if (lowerDescription.includes("sponsor")) {
    //   registrationType = {
    //     "ColorCode": "#000",
    //     "RegistrationType": "Sponsor",
    //     "RegistrationTypeId": "DgG5hTkMrGQBfmNNsViv"
    //   }
    // } else if (lowerDescription.includes("speaker")) {
    //   registrationType = {
    //     "ColorCode": "#000",
    //     "RegistrationType": "Speaker",
    //     "RegistrationTypeId": "kyamSq1PIgUr49NdKL3F"
    //   }
    // }

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
        "Country/Region",
        "LinkedinProfile",
        "Iwouldliketobeconsideredtoattendthepre-eventdinner",
        "Iwouldyouliketobeconsideredasaguestontheeventpodcastrecordedliveattheevent",
        "Pleaseconfirmifyouhaveanydietaryrestrictions?(writeNAifnothingapplies)",
        "IwouldlikeaccesstotheRetailXIntelligencedataplatform(freetrial)",
        "Iagreetoparticipationintheintroductorymeetingprogramme\"Connect\"inanetworkingbreak",
        "IfattendingChannelX,whichtrackareyoumostinterestedtoattend?",
        "IagreetotheT&C'sofregistrationincludingreceivingafreecopyoftherelevantresearchreport",
        "Whichoftheeventsareyoumostinterestedinattending?(Yourattendanceincludesafreecopyoftherelevantreport)?",
        "AreyouareRetaileroraBrand?",
        "Whatsectorareyouin?"
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

      ensureFieldExists("Country/Region", countryRegion, "Country / Region", "text");
      ensureFieldExists("LinkedinProfile", linkedinProfile, "Linkedin Profile", "text");
      ensureFieldExists("Iwouldliketobeconsideredtoattendthepre-eventdinner", preEventDinner, "I would like to be considered to attend the pre-event dinner", "select");
      ensureFieldExists("Iwouldyouliketobeconsideredasaguestontheeventpodcastrecordedliveattheevent", eventPodcast, "I would you like to be considered as a guest on the event podcast recorded live at the event", "select");
      ensureFieldExists("Pleaseconfirmifyouhaveanydietaryrestrictions?(writeNAifnothingapplies)", dietaryRestrictions, "Please confirm if you have any dietary restrictions? (write NA if nothing applies)", "text");
      ensureFieldExists("IwouldlikeaccesstotheRetailXIntelligencedataplatform(freetrial)", accessRetailX, "I would like access to the RetailX Intelligence data platform (free trial)", "select");
      ensureFieldExists("Iagreetoparticipationintheintroductorymeetingprogramme\"Connect\"inanetworkingbreak", agreeConnect, "I agree to participation in the introductory meeting programme \"Connect\" in a networking break", "checkbox");
      ensureFieldExists("IfattendingChannelX,whichtrackareyoumostinterestedtoattend?", channelXTrack, "If attending ChannelX, which track are you most interested to attend?", "radio");
      ensureFieldExists("IagreetotheT&C'sofregistrationincludingreceivingafreecopyoftherelevantresearchreport", tcAgree, "I agree to the T&C's of registration including receiving a free copy of the relevant research report", "select");
      ensureFieldExists("Whichoftheeventsareyoumostinterestedinattending?(Yourattendanceincludesafreecopyoftherelevantreport)?", interestedEvents, "Which of the events are you most interested in attending? (Your attendance includes a free copy of the relevant report)?", "multiselect");
      ensureFieldExists("AreyouareRetaileroraBrand?", retailerOrBrand, "Are you are Retailer or a Brand?", "multiselect");
      ensureFieldExists("Whatsectorareyouin?", sector, "What sector are you in?", "multiselect");
      ensureFieldExists("Company", company, "Company", "text");
      ensureFieldExists("Designation", designation, "Designation", "text");

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
        Company: company || "",
        Designation: designation || "",
        isComplete: true
      };
    }
  });
};

export const fetchAutumnFestivalAttendeeWebhook = async (req, res) => {
  try {
    const order = req.body; // The payload is the single order
    console.log(`📦 Processing order for: ${order.buyer_details?.email}`);

    // Validate required fields
    const email = order.buyer_details?.email;
    const ttEventId = order.event_summary?.id;
    if (!email || !ttEventId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email or event_summary.id)",
      });
    }

    // Check if email already exists in Supabase
    const tableName = 'autumn_festival_attendee'; // Table name for this webhook
    const emailExists = await checkEmailExists(tableName, email);
    if (emailExists) {
      console.log(`⚠️ Email already exists in Supabase, skipping: ${email}`);
      return res.status(200).json({
        success: true,
        message: `Order already processed for ${email}`,
      });
    }

    // Transform the order
    const transformedOrder = transformAutumnFestivalAttendee([order])[0]; // Transform single order
    if (!transformedOrder) {
      return res.status(400).json({
        success: false,
        error: "Failed to transform order",
      });
    }

    // Apply company code logic
    const companyField = transformedOrder.DynamicFields.find(
      field => field.Name === "Company" || field.Label === "Company"
    );
    let finalOrder = transformedOrder;

    if (companyField?.Value) {
      const normalize = str =>
        str?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') || '';
      const companyName = normalize(companyField.Value);
      const companyMatch = companyWithCode.find(company => {
        const normalizedKey = normalize(company.key);
        return companyName.includes(normalizedKey) || normalizedKey.includes(companyName);
      });

      if (companyMatch) {
        finalOrder = {
          ...transformedOrder,
          RegistrationType: {
            ...transformedOrder.RegistrationType,
            RegistrationTypeEntityId: companyMatch.value
          }
        };
      }
    }

    // Push to registration API
    console.log(`📤 Pushing to API: ${finalOrder.FirstName} ${finalOrder.LastName} | ${finalOrder.Email}`);
    const pushSuccess = await pushTransformedOrder(finalOrder, 1);
    if (!pushSuccess) {
      return res.status(500).json({
        success: false,
        error: `Failed to push order for ${finalOrder.Email} to registration API`,
      });
    }

    // Store in Supabase if API push was successful
    console.log(`✅ API push successful, storing in Supabase: ${finalOrder.Email}`);
    const stored = await storeEmailInSupabase(tableName, finalOrder.Email);
    if (!stored) {
      console.log(`⚠️ API succeeded but Supabase storage failed (duplicate): ${finalOrder.Email}`);
    }

    return res.status(200).json({
      success: true,
      message: `Order processed successfully for ${finalOrder.Email}`,
    });
  } catch (error) {
    console.error(`❌ Error processing order:`, error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
