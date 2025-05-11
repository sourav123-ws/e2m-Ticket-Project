import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
import { storeAllEmailInSupabase } from './supabase.js';
dotenv.config();

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SPRING_FESTIVAL_EVENT_ID = 'ev_4644551';
const QUESTION_TEXT = "Which event at the Spring Retail Festival are you attending?";
//const TARGET_EVENT = "SustainabilityX";
const REGISTRATION_API_URL = "https://us-central1-e2monair.cloudfunctions.net/e2mreg-prd-register-attendee";

const eventList = [
  "E1743162762857",
  "E1743162842566",
  "E1743162911584",
  "E1743163021441",
  "E1743163129042",
  "E1743163201304",
];
const eventConfig = {
  "E1743162762857": {
    companyWithCode: [
      { key: 'Ecommerce Intelligence', value: '34313000' },
      { key: 'Exertis Supply Chain', value: '34314000' },
      { key: 'Smart Scout', value: '34315000' },
      { key: 'Pattern', value: '34316000' },
      { key: 'WORLDFIRST', value: '34317000' },
      { key: 'Carbon6', value: '34318000' },

      { key: 'Channel Engine', value: '34319000' },
      { key: 'Ecommtent', value: '34320000' },
      { key: 'Azoma', value: '34686000' },
      { key: 'SpiderX', value: '34687000' },
      { key: 'RetailX', value: '34688000' },
      { key: 'FUTR', value: '34689000' },
      { key: 'EVRI', value: '35259000' },
      { key: 'STELLER SPRITE', value: '35261000' },
      { key: 'TRANSFERMATTE', value: '35318000' },
      { key: 'Luzern', value: '35707000' },
      { key: 'Checkoutchamp', value: '35741000' },
      { key: 'Dash Social', value: '35742000' },
      { key: 'PULSAR', value: '35743000' },
      { key: 'Metricool', value: '35744000' },
      { key: 'KUBBCO', value: '35745000' },
      { key: 'Epson', value: '35746000' },
      { key: 'IO.TT', value: '35747000' },
      { key: 'Evri', value: '35748000' },
      { key: 'Emarsys', value: '35749000' },
      { key: 'Adobe', value: '35750000' },
      { key: 'Imagino CNX', value: '35751000' },
      { key: 'TNS', value: '35752000' },
      { key: 'Yocuda', value: '35753000' },
      { key: 'Anicca Digital', value: '35754000' },
      { key: 'Vaimo', value: '35755000' },
      { key: 'Amplience', value: '35756000' },
      { key: 'Post Nord', value: '35757000' },
      { key: 'Commerce Media Tech', value: '35758000' },
      { key: 'SPIDERX', value: '35759000' },
      { key: 'Revlifter', value: '35760000' },
      { key: 'Optimizely', value: '35761000' },
      { key: 'Epsilon', value: '35762000' },
      { key: 'Smarter Ecommerce', value: '35763000' },
      { key: 'UBERALL', value: '35764000' },
      { key: 'Chargebee', value: '35765000' },
      { key: 'Advantage', value: '35766000' },
      { key: 'Bento Tech', value: '35767000' },
      { key: 'Ordergroove', value: '35768000' },
      { key: 'Recharge', value: '35769000' },
      { key: 'Butter Payments', value: '35770000' },
      { key: 'Orchestra Solutions', value: '35771000' },
      { key: 'Adyen', value: '35772000' },
      { key: 'Sovendus', value: '35773000' },
      { key: 'Recurly', value: '35774000' },
      { key: 'Webloyalty', value: '35775000' },
      { key: 'BLUEFORT', value: '35776000' },
      { key: 'ATLAS', value: '35777000' },
      { key: 'WORLD PAY', value: '35778000' },
      { key: 'Churned', value: '35779000' },
      { key: 'RetalX Intellegence', value: '35780000' },
      { key: 'SPACE & PEOPLE', value: '35781000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "r2N1DHJ0QGU3HKSPZkgu"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "r2N1DHJ0QGU3HKSPZkgu"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "IKvEZ4lAwXKwQcNjIWlD"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "zwRGDlyrF35uoSu0hPJP"
        }
      },
    },
    TARGET_EVENT: "Amazon Sellers Summit",
  },
  "E1743162842566": {
    companyWithCode: [
      { key: 'Checkoutchamp', value: '34331000' },
      { key: 'Dash Social', value: '34332000' },
      { key: 'PULSAR', value: '34333000' },
      { key: 'Metricool', value: '34355000' },

      { key: 'SpiderX', value: '34683000' },
      { key: 'RetailX', value: '34684000' },
      { key: 'FUTR', value: '34685000' },
      { key: 'KUBBCO', value: '35319000' },
      { key: 'Ecommerce Intelligence', value: '35782000' },
      { key: 'Exertis Supply Chain', value: '35783000' },
      { key: 'Smart Scout', value: '35784000' },
      { key: 'Pattern', value: '35785000' },
      { key: 'WORLDFIRST', value: '35786000' },
      { key: 'Carbon6', value: '35787000' },
      { key: 'Channel Engine', value: '35788000' },
      { key: 'Ecommtent', value: '35789000' },
      { key: 'Azoma', value: '35790000' },
      { key: 'EVRI', value: '35791000' },
      { key: 'STELLER SPRITE', value: '35792000' },
      { key: 'TRANSFERMATTE', value: '35793000' },
      { key: 'Luzern', value: '35794000' },
      { key: 'Epson', value: '35795000' },
      { key: 'IO.TT', value: '35796000' },
      { key: 'Evri', value: '35797000' },
      { key: 'Emarsys', value: '35798000' },
      { key: 'Adobe', value: '35799000' },
      { key: 'Imagino CNX', value: '35800000' },
      { key: 'TNS', value: '35801000' },
      { key: 'Yocuda', value: '35802000' },
      { key: 'Anicca Digital', value: '35803000' },
      { key: 'Vaimo', value: '35804000' },
      { key: 'Amplience', value: '35805000' },
      { key: 'Post Nord', value: '35806000' },
      { key: 'Commerce Media Tech', value: '35807000' },
      { key: 'SPIDERX', value: '35808000' },
      { key: 'Revlifter', value: '35809000' },
      { key: 'Optimizely', value: '35810000' },
      { key: 'Epsilon', value: '35811000' },
      { key: 'Smarter Ecommerce', value: '35812000' },
      { key: 'UBERALL', value: '35813000' },
      { key: 'Chargebee', value: '35814000' },
      { key: 'Advantage', value: '35815000' },
      { key: 'Bento Tech', value: '35816000' },
      { key: 'Ordergroove', value: '35817000' },
      { key: 'Recharge', value: '35818000' },
      { key: 'Butter Payments', value: '35819000' },
      { key: 'Orchestra Solutions', value: '35820000' },
      { key: 'Adyen', value: '35821000' },
      { key: 'Sovendus', value: '35822000' },
      { key: 'Recurly', value: '35823000' },
      { key: 'Webloyalty', value: '35824000' },
      { key: 'BLUEFORT', value: '35825000' },
      { key: 'ATLAS', value: '35826000' },
      { key: 'WORLD PAY', value: '35827000' },
      { key: 'Churned', value: '35828000' },
      { key: 'RetalX Intellegence', value: '35829000' },
      { key: 'SPACE & PEOPLE', value: '35830000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "aBBEc9n1nwFuguN9i7LD"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "aBBEc9n1nwFuguN9i7LD"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "LXGs4IOLckXt9j04eUMJ"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "Qs28qtCkv9lhnPDNfthX"
        }
      },
    },
    TARGET_EVENT: "Social Media Masters",
  },
  "E1743162911584": {
    companyWithCode: [
      { key: 'Epson', value: '34354000' },
      { key: 'RetailX', value: '34682000' },
      { key: 'IO.TT', value: '35256000' },
      { key: 'Evri', value: '35706000' },
      { key: 'Ecommerce Intelligence', value: '35831000' },
      { key: 'Exertis Supply Chain', value: '35832000' },
      { key: 'Smart Scout', value: '35833000' },
      { key: 'Pattern', value: '35834000' },
      { key: 'WORLDFIRST', value: '35835000' },
      { key: 'Carbon6', value: '35836000' },
      { key: 'Channel Engine', value: '35837000' },
      { key: 'Ecommtent', value: '35838000' },
      { key: 'Azoma', value: '35839000' },
      { key: 'SpiderX', value: '35840000' },
      { key: 'FUTR', value: '35841000' },
      { key: 'EVRI', value: '35842000' },
      { key: 'STELLER SPRITE', value: '35843000' },
      { key: 'TRANSFERMATTE', value: '35844000' },
      { key: 'Luzern', value: '35845000' },
      { key: 'Checkoutchamp', value: '35846000' },
      { key: 'Dash Social', value: '35847000' },
      { key: 'PULSAR', value: '35848000' },
      { key: 'Metricool', value: '35849000' },
      { key: 'KUBBCO', value: '35850000' },
      { key: 'Emarsys', value: '35851000' },
      { key: 'Adobe', value: '35852000' },
      { key: 'Imagino CNX', value: '35853000' },
      { key: 'TNS', value: '35854000' },
      { key: 'Yocuda', value: '35855000' },
      { key: 'Anicca Digital', value: '35856000' },
      { key: 'Vaimo', value: '35857000' },
      { key: 'Amplience', value: '35858000' },
      { key: 'Post Nord', value: '35859000' },
      { key: 'Commerce Media Tech', value: '35860000' },
      { key: 'SPIDERX', value: '35861000' },
      { key: 'Revlifter', value: '35862000' },
      { key: 'Optimizely', value: '35863000' },
      { key: 'Epsilon', value: '35864000' },
      { key: 'Smarter Ecommerce', value: '35865000' },
      { key: 'UBERALL', value: '35866000' },
      { key: 'Chargebee', value: '35867000' },
      { key: 'Advantage', value: '35868000' },
      { key: 'Bento Tech', value: '35869000' },
      { key: 'Ordergroove', value: '35870000' },
      { key: 'Recharge', value: '35871000' },
      { key: 'Butter Payments', value: '35872000' },
      { key: 'Orchestra Solutions', value: '35873000' },
      { key: 'Adyen', value: '35874000' },
      { key: 'Sovendus', value: '35875000' },
      { key: 'Recurly', value: '35876000' },
      { key: 'Webloyalty', value: '35877000' },
      { key: 'BLUEFORT', value: '35878000' },
      { key: 'ATLAS', value: '35879000' },
      { key: 'WORLD PAY', value: '35880000' },
      { key: 'Churned', value: '35881000' },
      { key: 'RetalX Intellegence', value: '35882000' },
      { key: 'SPACE & PEOPLE', value: '35883000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "IDcDKMY6E6l9z2Ad394v"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "IDcDKMY6E6l9z2Ad394v"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "muphyH66ZmnnA48KlmhE"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "BVdFH7eQz12qX8cEz1S1"
        }
      },
    },
    TARGET_EVENT: "SustainabilityX"
  },
  "E1743163021441": {
    companyWithCode: [
      { key: 'SpiderX', value: '34670000' },
      { key: 'Emarsys', value: '34671000' },
      { key: 'Adobe', value: '34672000' },
      { key: 'Imagino CNX', value: '34673000' },
      { key: 'RetailX', value: '34674000' },
      { key: 'FUTR', value: '34675000' },

      { key: 'TNS', value: '35703000' },
      { key: 'Yocuda', value: '35704000' },
      { key: 'Ecommerce Intelligence', value: '35884000' },
      { key: 'Exertis Supply Chain', value: '35885000' },
      { key: 'Smart Scout', value: '35886000' },
      { key: 'Pattern', value: '35887000' },
      { key: 'WORLDFIRST', value: '35888000' },
      { key: 'Carbon6', value: '35889000' },
      { key: 'Channel Engine', value: '35890000' },
      { key: 'Ecommtent', value: '35891000' },
      { key: 'Azoma', value: '35892000' },
      { key: 'EVRI', value: '35893000' },
      { key: 'STELLER SPRITE', value: '35894000' },
      { key: 'TRANSFERMATTE', value: '35895000' },
      { key: 'Luzern', value: '35896000' },
      { key: 'Checkoutchamp', value: '35897000' },
      { key: 'Dash Social', value: '35898000' },
      { key: 'PULSAR', value: '35899000' },
      { key: 'Metricool', value: '35900000' },
      { key: 'KUBBCO', value: '35901000' },
      { key: 'Epson', value: '35902000' },
      { key: 'IO.TT', value: '35903000' },
      { key: 'Evri', value: '35904000' },
      { key: 'Anicca Digital', value: '35905000' },
      { key: 'Vaimo', value: '35906000' },
      { key: 'Amplience', value: '35907000' },
      { key: 'Post Nord', value: '35908000' },
      { key: 'Commerce Media Tech', value: '35909000' },
      { key: 'SPIDERX', value: '35910000' },
      { key: 'Revlifter', value: '35911000' },
      { key: 'Optimizely', value: '35912000' },
      { key: 'Epsilon', value: '35913000' },
      { key: 'Smarter Ecommerce', value: '35914000' },
      { key: 'UBERALL', value: '35915000' },
      { key: 'Chargebee', value: '35916000' },
      { key: 'Advantage', value: '35917000' },
      { key: 'Bento Tech', value: '35918000' },
      { key: 'Ordergroove', value: '35919000' },
      { key: 'Recharge', value: '35920000' },
      { key: 'Butter Payments', value: '35921000' },
      { key: 'Orchestra Solutions', value: '35922000' },
      { key: 'Adyen', value: '35923000' },
      { key: 'Sovendus', value: '35924000' },
      { key: 'Recurly', value: '35925000' },
      { key: 'Webloyalty', value: '35926000' },
      { key: 'BLUEFORT', value: '35927000' },
      { key: 'ATLAS', value: '35928000' },
      { key: 'WORLD PAY', value: '35929000' },
      { key: 'Churned', value: '35930000' },
      { key: 'RetalX Intellegence', value: '35931000' },
      { key: 'SPACE & PEOPLE', value: '35932000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "oaWbWfKB0q3rJzrvenrT"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "oaWbWfKB0q3rJzrvenrT"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "H415FjQN53rAaWrfm47x"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "eTFSFZxk98HQYo3RfRBy"
        }
      },
    },
    TARGET_EVENT: "CustomerX",
  },
  "E1743163129042": {
    companyWithCode: [
      { key: 'Anicca Digital', value: '34321000' },
      { key: 'Vaimo', value: '34322000' },
      { key: 'Amplience', value: '34323000' },
      { key: 'Post Nord', value: '34324000' },
      { key: 'Commerce Media Tech', value: '34326000' },
      { key: 'SPIDERX', value: '34327000' },
      { key: 'Revlifter', value: '34328000' },
      { key: 'Optimizely', value: '34329000' },
      { key: 'Checkoutchamp', value: '34330000' },
      { key: 'Azoma', value: '34678000' },
      { key: 'Epsilon', value: '34679000' },
      { key: 'RetailX', value: '34680000' },
      { key: 'FUTR', value: '34681000' },
      { key: 'Smarter Ecommerce', value: '35178000' },
      { key: 'UBERALL', value: '35320000' },
      { key: 'Yocuda', value: '35473000' },
      { key: 'Ecommerce Intelligence', value: '35933000' },
      { key: 'Exertis Supply Chain', value: '35934000' },
      { key: 'Smart Scout', value: '35935000' },
      { key: 'Pattern', value: '35936000' },
      { key: 'WORLDFIRST', value: '35937000' },
      { key: 'Carbon6', value: '35938000' },
      { key: 'Channel Engine', value: '35939000' },
      { key: 'Ecommtent', value: '35940000' },
      { key: 'SpiderX', value: '35941000' },
      { key: 'EVRI', value: '35942000' },
      { key: 'STELLER SPRITE', value: '35943000' },
      { key: 'TRANSFERMATTE', value: '35944000' },
      { key: 'Luzern', value: '35945000' },
      { key: 'Dash Social', value: '35946000' },
      { key: 'PULSAR', value: '35947000' },
      { key: 'Metricool', value: '35948000' },
      { key: 'KUBBCO', value: '35949000' },
      { key: 'Epson', value: '35950000' },
      { key: 'IO.TT', value: '35951000' },
      { key: 'Evri', value: '35952000' },
      { key: 'Emarsys', value: '35953000' },
      { key: 'Adobe', value: '35954000' },
      { key: 'Imagino CNX', value: '35955000' },
      { key: 'TNS', value: '35956000' },
      { key: 'Chargebee', value: '35957000' },
      { key: 'Advantage', value: '35958000' },
      { key: 'Bento Tech', value: '35959000' },
      { key: 'Ordergroove', value: '35960000' },
      { key: 'Recharge', value: '35961000' },
      { key: 'Butter Payments', value: '35962000' },
      { key: 'Orchestra Solutions', value: '35963000' },
      { key: 'Adyen', value: '35964000' },
      { key: 'Sovendus', value: '35965000' },
      { key: 'Recurly', value: '35966000' },
      { key: 'Webloyalty', value: '35967000' },
      { key: 'BLUEFORT', value: '35968000' },
      { key: 'ATLAS', value: '35969000' },
      { key: 'WORLD PAY', value: '35970000' },
      { key: 'Churned', value: '35971000' },
      { key: 'RetalX Intellegence', value: '35972000' },
      { key: 'SPACE & PEOPLE', value: '35973000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "O3xV8xvdYNk5heJHSiyd"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "O3xV8xvdYNk5heJHSiyd"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "kCxcYVaSrfyz4uz0KPr3"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "kTOVxMbVwpDji8gWCwbN"
        }
      },
    },
    TARGET_EVENT: "Digital Marketing Evolution",
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
      { key: 'RetalX Intellegence', value: '34353000' },

      { key: 'SpiderX', value: '34676000' },
      { key: 'FUTR', value: '34677000' },
      { key: 'SPACE & PEOPLE', value: '35257000' },
      { key: 'EVRI', value: '35258000' },
      { key: 'Ecommerce Intelligence', value: '35974000' },
      { key: 'Exertis Supply Chain', value: '35975000' },
      { key: 'Smart Scout', value: '35976000' },
      { key: 'Pattern', value: '35977000' },
      { key: 'WORLDFIRST', value: '35978000' },
      { key: 'Carbon6', value: '35979000' },
      { key: 'Channel Engine', value: '35980000' },
      { key: 'Ecommtent', value: '35981000' },
      { key: 'Azoma', value: '35982000' },
      { key: 'RetailX', value: '35983000' },
      { key: 'STELLER SPRITE', value: '35984000' },
      { key: 'TRANSFERMATTE', value: '35985000' },
      { key: 'Luzern', value: '35986000' },
      { key: 'Checkoutchamp', value: '35987000' },
      { key: 'Dash Social', value: '35988000' },
      { key: 'PULSAR', value: '35989000' },
      { key: 'Metricool', value: '35990000' },
      { key: 'KUBBCO', value: '35991000' },
      { key: 'Epson', value: '35992000' },
      { key: 'IO.TT', value: '35993000' },
      { key: 'Evri', value: '35994000' },
      { key: 'Emarsys', value: '35995000' },
      { key: 'Adobe', value: '35996000' },
      { key: 'Imagino CNX', value: '35997000' },
      { key: 'TNS', value: '35998000' },
      { key: 'Yocuda', value: '35999000' },
      { key: 'Anicca Digital', value: '36000000' },
      { key: 'Vaimo', value: '36001000' },
      { key: 'Amplience', value: '36002000' },
      { key: 'Post Nord', value: '36003000' },
      { key: 'Commerce Media Tech', value: '36004000' },
      { key: 'SPIDERX', value: '36005000' },
      { key: 'Revlifter', value: '36006000' },
      { key: 'Optimizely', value: '36007000' },
      { key: 'Epsilon', value: '36008000' },
      { key: 'Smarter Ecommerce', value: '36009000' },
      { key: 'UBERALL', value: '36010000' }
    ],
    registrationType: {
      "ColorCode": "#000",
      "RegistrationType": "Attendee",
      "RegistrationTypeId": "uUT8CeS4FPNMdWAfHMK0"
    },
    registrationTypes: {
      "Attendee": {
        "ColorCode": "#000",
        "RegistrationType": "Attendee",
        "RegistrationTypeId": "uUT8CeS4FPNMdWAfHMK0"
      },
      "Sponsor": {
        "ColorCode": "#000",
        "RegistrationType": "Sponsor",
        "RegistrationTypeId": "AgZUfUjgdJSeiWxkjaar"
      },
      "Speaker": {
        registrationType: {
          "ColorCode": "#000",
          "RegistrationType": "Speaker",
          "RegistrationTypeId": "tT5mKR9CsBoREbypYOF9"
        }
      },
    },
    TARGET_EVENT: "SubscriptionX",
  },
};
// const companyWithCode = [{ key: 'SpiderX', value: '34670000' },
// { key: 'Emarsys', value: '34671000' },
// { key: 'Adobe', value: '34672000' },
// { key: 'Imagino CNX', value: '34673000' },
// { key: 'RetailX', value: '34674000' },
// { key: 'FUTR', value: '34675000' }]

const pushTransformedOrder = async (order, attempt = 1, event_id) => {
  const payload = {
    postToCRM: false,
    key: {
      instanceId: "OA_UAT",
      clientId: "C1742212403583",
      // eventId: "E1743162911584",
      eventId: event_id,
      bundleId: "u7KpSiKT0MtZ2z4JccWS",
    },
    data: [order],
  };

  try {
    const response = await axios.post(REGISTRATION_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data?.status == 0) {
      console.log(`✅ [Try ${attempt}] Pushed: ${response.data}`);
      const stored = await storeAllEmailInSupabase('all_spring_festival', order.Email, event_id, true);
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

    let registrationType;

    if (lowerDescription.includes("brand") ||
      lowerDescription.includes("staff") ||
      lowerDescription.includes("retailer") ||
      lowerDescription.includes("vendor") ||
      lowerDescription.includes("agency")) {
      // registrationType = eventConfig[event_id].registrationType;
      registrationType = eventConfig[event_id].registrationTypes.Attendee;
    } else if (lowerDescription.includes("sponsor")) {
      registrationType = eventConfig[event_id].registrationTypes.Sponsor;
    } else if (lowerDescription.includes("speaker")) {
      registrationType = eventConfig[event_id].registrationTypes.Speaker;
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
        qr_code: order.issued_tickets?.[0]?.barcode || "",
        qr: order.issued_tickets?.[0]?.qr_code_url || "",
        Company: Company,
        Designation: Designation,
        isComplete: true
      };
    }
  });
};

export const fetchSpringFestivalOrders = async () => {
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
    // const userEmail = "daniel.bacon@epson.eu";
    const subscriptionXOrders = allOrders.filter(order => {
      const questions = order.buyer_details?.custom_questions || [];
      return questions.some(q =>
        q.question?.includes(QUESTION_TEXT)
        // &&
        // // q.answer?.includes(TARGET_EVENT) &&
        // order.buyer_details?.email == userEmail
      );
    });
    //---------------------------
    for (let i = 0; i < eventList.length; i++) {
      const eventId = eventList[i];
      const { companyWithCode, TARGET_EVENT } = eventConfig[eventId];
      try {
        const transformedOrders = transformOrders(subscriptionXOrders, eventId);
        // if (transformedOrders.length == 1) {
        //   console.log("transformedOrders?????????????????????????????????????????????????????????????????????????????", transformedOrders);
        //   // return [];
        // } else {
        //   console.log("transformedOrders>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", transformedOrders);
        //   // return [];
        // }
        const finalOrders = transformedOrders.map(order => {
          if (order && order.RegistrationType && order.RegistrationType?.RegistrationType === "Sponsor") {
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

        // console.log("finalOrders", finalOrders);

        // if (transformedOrders.length == 1) {
        //   return [];
        // } else {
        //   return [];
        // }
        let successCount = 0;
        let failCount = 0;

        for (const order of finalOrders) {
          if (order) {
            console.log(`📦 Checking: ${order.FirstName} ${order.LastName} | ${order.Email} | QR: ${order.qr_code}`);

            const stored = await storeAllEmailInSupabase('all_spring_festival', order.Email, eventId);

            if (!stored) {
              console.log(`⏩ Skipping push for duplicate email: ${order.Email}`);
              continue; // don't push if duplicate
            }

            console.log(`📤 Pushing: ${order.FirstName} ${order.LastName} | ${order.Email}`);
            await pushTransformedOrder(order, 1, eventId);

            await new Promise(resolve => setTimeout(resolve, 300)); // rate limiting
          }
        }

        console.log(`✅ Saved ${finalOrders.length} transformed Subscription orders`);
        console.log(`✅ Successfully pushed: ${successCount}`);
        console.log(`❌ Failed to push: ${failCount}`);
        console.log(`📊 Total attempted: ${successCount + failCount}`);
      } catch (error) {
        console.error("❌ Error:", error.message);
        fs.writeFileSync(
          "subscriptionx_orders_error.json",
          JSON.stringify({ error: error.message }, null, 2)
        );
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

fetchSpringFestivalOrders()
