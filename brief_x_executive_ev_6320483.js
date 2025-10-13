import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import { checkEmailExists, logE2MError, storeEmailInSupabase } from "./supabase.js";
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const RETAILX_BRIEF_EXECUTIVE_SPEAKER_ATTENDEE = "ev_6320483";
const E2M_EVENT_ID = "E1753774391797";
const REGISTRATION_API_URL =
  "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const companyWithCode = [
  { key: "AppsFlyer", value: "36455000" },
  { key: "DPAA", value: "36456000" },
  { key: "Epsilon", value: "36451000" },
  { key: "FMCG Guys", value: "36457000" },
  { key: "IAB Europe", value: "36474000" },
  { key: "Koddi", value: "36452000" },
  { key: "LiverRamp", value: "36448000" },
  { key: "Mirakl", value: "36453000" },
  { key: "STRATACACHE", value: "36449000" },
  { key: "dunnhumby", value: "36450000" },
];

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

  return payload ;
};

const transformRetailXOrders = (orders) => {
  return orders
    .map((order) => {
      const customQuestions = order.buyer_details?.custom_questions || [];

      const findAnswer = (questionText) => {
        const match = customQuestions.find(
          (q) =>
            q.question.trim().toLowerCase() ===
            questionText.toLowerCase().trim()
        );
        return match?.answer || "";
      };

      // Map Company and Designation from custom questions
      const Company =
        findAnswer("Company") || findAnswer("Company/Organisation") || "";
      const Designation =
        findAnswer("Designation") || findAnswer("Job title") || "";

      // Country/Region
      const countryRegion =
        findAnswer("Country/Region") || findAnswer("Country / Region") || "";

      // Build DynamicFields using the exact label and a normalized name
      let filteredDynamicFields = customQuestions.map((question) => ({
        Name: question.question.replace(/\s+/g, "").replace(/[^\w]/g, ""),
        Value: question.answer || "",
        Label: question.question,
        Type: Array.isArray(question.answer) ? "multiselect" : "text",
      }));

      // Add essential fields if missing
      const addField = (name, value, label, type) => {
        if (!filteredDynamicFields.some((f) => f.Name === name)) {
          filteredDynamicFields.push({
            Name: name,
            Value: value,
            Label: label,
            Type: type,
          });
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
      if (
        lowerDescription.includes("brand") ||
        lowerDescription.includes("brand") ||
        lowerDescription.includes("staff") ||
        lowerDescription.includes("retailer") ||
        lowerDescription.includes("vendor") ||
        lowerDescription.includes("agency") ||
        lowerDescription.includes("marketplace")
      ) {
        registrationType = {
          ColorCode: "#000",
          RegistrationType: "Attendee",
          RegistrationTypeId: "992EnMfWz3u8ZhJMqx1f",
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
          isComplete: true,
        };
      }
    })
    .filter(Boolean);
};

export const fetchRetailXExecutiveOrdersForEv_6320483 = async (order) => {
  try {
    console.log(`📦 Processing order for: ${order.buyer_details?.email}`);

    // Validate required fields
    const email = order.buyer_details?.email;
    const ttEventId = order.event_summary?.id;
    if (!email || !ttEventId) {
      return {
        success: false,
        error: "Missing required fields (email or event_summary.id)",
      };
    }


    // Transform the order
    const transformedOrder = transformRetailXOrders([order])[0]; // Transform single order
    if (!transformedOrder) {
      return {
        success: false,
        error: "Failed to transform order",
      };
    }

    // Apply company code logic
    const companyField = transformedOrder.DynamicFields.find(
      (field) =>
        field.Name === "Company/Organisation" ||
        field.Label === "Company/Organisation"
    );
    let finalOrder = transformedOrder;

    if (
      companyField?.Value &&
      transformedOrder.RegistrationType?.RegistrationType === "Sponsor"
    ) {
      const normalize = (str) =>
        str?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/gi, "") || "";
      const companyName = normalize(companyField.Value);
      const companyMatch = companyWithCode.find((company) => {
        const normalizedKey = normalize(company.key);
        return (
          companyName.includes(normalizedKey) ||
          normalizedKey.includes(companyName)
        );
      });

      if (companyMatch) {
        finalOrder = {
          ...transformedOrder,
          RegistrationType: {
            ...transformedOrder.RegistrationType,
            RegistrationTypeEntityId: companyMatch.value,
          },
        };
      }
    }

    // Push to registration API
    console.log(
      `📤 Pushing to API: ${finalOrder.FirstName} ${finalOrder.LastName} | ${finalOrder.Email}`
    );
    const pushSuccess = await pushTransformedOrder(finalOrder, 1);
    if (!pushSuccess) {
      return {
        success: false,
        error: `Failed to push order for ${finalOrder.Email} to registration API`,
      };
    }


    return {
      success: true,
      message: `Order processed successfully for ${finalOrder.Email}`,
      payload: pushSuccess,
    };
  } catch (error) {
    console.error(`❌ Error processing order:`, error.message);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
};
