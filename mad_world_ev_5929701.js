import dotenv from "dotenv";
dotenv.config();

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

  return payload ;
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
          PhoneCountryCode: order.buyer_details?.phone_country_code || "",
          Phone: order.buyer_details?.phone || "",
          Address: order.buyer_details?.address?.address_1 || "",
          Zip: order.buyer_details?.address?.postal_code || "",
          qr_code: order.issued_tickets?.[0]?.barcode || "",
          qr: order.issued_tickets?.[0]?.qr_code_url || "",
          Company: Company || "",
          Designation: Designation || "",
          isComplete: true,
        };
      }
    })
    .filter((order) => order !== undefined);
};

export const fetchMadWorldOrdersForEv_5929701Webhook = async (order) => {
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
    const transformedOrder = transformMadWorldOrders([order])[0];
    if (!transformedOrder) {
      return {
        success: false,
        error: "Failed to transform order",
      };
    }

    // Apply company code logic for sponsors
    const companyField = transformedOrder.DynamicFields.find(
      (field) => field.Name === "Company/Organisation" || field.Label === "Company/Organisation"
    );
    let finalOrder = transformedOrder;

    if (
      transformedOrder.RegistrationType?.RegistrationType === "Sponsor" &&
      companyField?.Value
    ) {
      const normalize = (str) =>
        str?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/gi, "") || "";
      const companyName = normalize(companyField.Value);
      const companyMatch = companyWithCode.find((company) => {
        const normalizedKey = normalize(company.key);
        return companyName.includes(normalizedKey) || normalizedKey.includes(companyName);
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
    console.log(`📤 Pushing to API: ${finalOrder.FirstName} ${finalOrder.LastName} | ${finalOrder.Email}`);
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
