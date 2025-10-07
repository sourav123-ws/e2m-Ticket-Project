import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import { checkEmailExists , logE2MError , storeEmailInSupabase } from './supabase.js';
dotenv.config();

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const AUTUMN_FESTIVAL_EVENT_ID = 'ev_4739999';
const E2M_EVENT_ID = 'E1757055673945';
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [{ key: 'Mirakl', value: '36458000' },
{ key: 'WorldFirst', value: '36459000' },
{ key: 'Virtual Stock', value: '36460000' },
{ key: 'Carbon6', value: '36461000' },
{ key: 'Photoroom', value: '36462000' },
{ key: 'Pattern', value: '36463000' },
{ key: 'Salesforce', value: '36464000' },
{ key: 'Linnworks', value: '36465000' },
{ key: 'AppsFlyer', value: '36466000' },
{ key: 'Koddi', value: '36467000' },
{ key: 'Webloyalty', value: '36469000' },
{ key: 'ChannelEngine', value: '36470000' },
{ key: 'Commerce Media Tech', value: '36472000' },
{ key: 'Canto', value: '36476000' },
{ key: 'Proptexx', value: '36477000' },
{ key: 'Somerce', value: '36478000' },
{ key: 'Kubbco', value: '36479000' },
{ key: 'So Squared', value: '36480000' },
{ key: 'Addingwell by Didomi', value: '36481000' },
{ key: 'Aria', value: '36484000' },
{ key: 'PXP', value: '36485000' },
{ key: 'Imagino', value: '36486000' },
{ key: 'LiveRamp', value: '36487000' },
{ key: 'STRATACACHE', value: '36488000' },
{ key: 'eDesk', value: '37953000' },
{ key: 'Disrupt', value: '37954000' },
{ key: 'Ignite AI Partners', value: '38007000' },
{ key: 'Zitec', value: '38008000' },
{ key: 'Simpler', value: '36511000' },
{ key: 'Azoma', value: '38020000' },
{ key: 'Sprii', value: '38371000' },
{ key: 'Shopping IQ', value: '38374000' },
{ key: 'WhatSales', value: '38377000' },
{ key: 'The Despatch Company', value: '38379000' },
{ key: 'Glopal', value: '38380000' },
{ key: 'Mangopay', value: '38383000' },
{ key: 'GS1 UK', value: '38385000' },
{ key: 'ACI Worldwide', value: '38386000' },
{ key: 'Listabl', value: '38388000' },
{ key: 'The Agency', value: '38389000' },
{ key: 'Quid', value: '38390000' },
{ key: 'Savi', value: '38391000' },
{ key: 'Passport', value: '38392000' },
{ key: 'Seonali', value: '38393000' },
{ key: 'Influencer Hero', value: '38395000' },
{ key: 'Galvia', value: '38396000' },
{ key: 'Merkle', value: '38397000' },
{ key: 'PSE Agency', value: '38398000' },
{ key: 'LiiveRamp', value: '38402000' },
{ key: 'Dunnhumby', value: '38403000' },
{ key: 'Epsilon', value: '38404000' },
{ key: 'Mirakl Ads', value: '38405000' },
{ key: 'Helm', value: '38478000' },
{ key: 'Kevel', value: '38479000' },
{ key: 'Listable', value: '38484000' },
{ key: 'Brightpearl', value: '38485000' },
{ key: 'Inventory Planner', value: '38486000' },
{ key: 'Vimeo', value: '38515000' },
{ key: 'Shopline', value: '38516000' },
{ key: 'E Business Guru', value: '38517000' },
{ key: 'Trojan Ecommerce', value: '38518000' },
{ key: 'Mollie', value: '38519000' },
{ key: 'BlaziAI', value: '38626000' }];

const pushTransformedOrder = async (order, attempt = 1) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      eventId: "E1757055673945",
      bundleId: "XlQa3dSUAWOyrYa9r6z4",
    },
    data: [order],
  };

  return payload;
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
      "RegistrationTypeId": "acSKVc0UTEshdsZRNPkM"
    };

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

export const fetchTestEventWebhook = async (order) => {
  try {
    console.log(`📦 Processing order for: ${order.buyer_details?.email}`);
    console.log("Here")
    // Validate required fields
    const email = order.buyer_details?.email;
    const ttEventId = order.event_summary?.id;
        console.log("Here2")

    if (!email || !ttEventId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email or event_summary.id)",
      });
    }
    console.log("HERE")

    // Transform the order
    const transformedOrder = transformAutumnFestivalAttendee([order])[0];
    console.log(transformedOrder)
    if (!transformedOrder) {
      return res.status(400).json({
        success: false,
        error: "Failed to transform order",
      });
    }
        console.log("HERE3")

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
          }
        };
      }
    }
        console.log("HERE4")

    // Push to registration API
    console.log(`📤 Pushing to API: ${finalOrder.FirstName} ${finalOrder.LastName} | ${finalOrder.Email}`);
    const pushSuccess = await pushTransformedOrder(finalOrder, 1);

    console.log("Push Success:", pushSuccess);
    return {
      success: true,
      message: `Order processed successfully for ${finalOrder.Email}`,
      payload: pushSuccess,
    };

  } catch (error) {
    console.error(`❌ Error processing order:`, error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
