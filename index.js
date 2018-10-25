// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
'use strict';


const functions = require('firebase-functions');

const { WebhookClient } = require('dialogflow-fulfillment');

const request = require('request');

// init firestore
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// init fb

var FB = require('fb');
FB.options({ Promise: Promise });
FB.setAccessToken('aqui fica seu token de acesso');


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
      agent.add('Ola '+nome+' tudo bem? ');
      
      var options = { method: 'POST',
 url: 'https://script.google.com/macros/s/AKfycbzhuv1-iXcfcDH8zeVlPbfurhZo4Q01wY_uUsYmvuBELmaTl0E/exec',
 headers: 
  {'cache-control': 'no-cache',
    'content-type': 'application/json' },
 body: { row: nome},
 json: true };

request(options, function (error, response, body) {
 if (error) throw new Error(error);

 console.log(body);
}); 
    }).catch((error) => {
      agent.add("Desculpe, não sei seu nome :( ");

    });
  
}}
