// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
'use strict';


const functions = require('firebase-functions');

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const firebase = require("firebase");
const request = require('request');

// init firestore
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// init fb   
var FB = require('fb');
FB.options({ Promise: Promise });


FB.setAccessToken('');




process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

  const agent = new WebhookClient({ request, response });
  let intentMap = new Map();


  intentMap.set('boasVindas', boasVindas);

  agent.handleRequest(intentMap);
});


function boasVindas(agent) {
  //console.log(JSON.stringify(agent.originalRequest.payload.data.sender));


  let platformPayload = agent.originalRequest.payload;
  let senderId;
  let nome;

  if (platformPayload.source == "facebook") {
    senderId = platformPayload.data.sender.id;
    return FB.api(senderId, 'GET').then((response) => {
      nome = response.name;

      agent.add('Olá' + nome);

      var options = {
        method: 'POST',
        url: 'https://script.google.com/macros/s/AKfycbzhuv1-iXcfcDH8zeVlPbfurhZo4Q01wY_uUsYmvuBELmaTl0E/exec',
        body: {
          row: nome
        },

        headers: {
          'cache-control': 'no-cache'
        }

      };
      request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        let ret = JSON.parse(body);
        console.log(ret);
        
      });
    }).catch((error) => {
      agent.add("Desculpe, não sei seu nome :( ");

    });
  
}}

// Get the database collection 'dialogflow' and document 'agent' and store
// the document  {entry: "<value of database entry>"} in the 'agent' document


//firebase deploy --only functions
