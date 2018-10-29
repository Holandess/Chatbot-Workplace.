// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
'use strict';

const functions = require('firebase-functions');

const { WebhookClient, Image } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const firebase = require("firebase");
const request = require('request');
const { google } = require('googleapis');

// init firestore
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// IMPORTAÇÃO DO REQUEST E DATATIME
// const requests = require('requests');
// const datetime = require('datetime');

// init fb   
var FB = require('fb');
FB.options({ Promise: Promise });


FB.setAccessToken('');



process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

  const agent = new WebhookClient({ request, response });

  let intentMap = new Map();
  intentMap.set('Mapa inicial.1-Começar', mapaInicial);
  intentMap.set('Conversa Final.3-Like ou Deslike', enviarPlanilha);
  agent.handleRequest(intentMap);
});



function mapaInicial(agent) {
  //console.log(JSON.stringify(agent.originalRequest.payload.data.sender));


  let platformPayload = agent.originalRequest.payload;
  let senderId;
  let nome;
  let nomeSplit;

  /* Em caso de necessidade imagem da assistente.  
  let image = new Image('https://storage.googleapis.com/marista-chatbot.appspot.com/avatarDhoraApresentacao.jpg'); 
  */

  if (platformPayload.source == "facebook") {
    senderId = platformPayload.data.sender.id;
    return FB.api(senderId, 'GET').then((response) => {

      nome = response.name;
      nomeSplit = nome.split(" ", 1);

      agent.add('Olá ' + nomeSplit + ', tudo bem?');
      agent.add('Eu sou a Dhora, consultora virtual da DDHO. Hoje eu gostaria de falar com você sobre a Pesquisa de Engajamento do Grupo Marista. Se você puder agora, clique em começar e vamos lá');
    }).catch((error) => {
      agent.add("Desculpe, não sei seu nome :( ");

    });

  }
}

function enviarPlanilha(agent) {
  let con = agent.contexts;
  console.log(con);
  let param;
  for (let i = 0; i < con.length; i++) {
    if (con[i].name === 'master-followup') {
      param = con[i].parameters;
      console.log("Contexto " + con[i].name + ":" + con[i]);
    }
  }
  console.log("Parameters:" + param);

  let arrayParam = [
    param.frenteDeMissao,
    param.diretoriaArea,
    param.simNaoResultadosPesquisas,
    param.gestorCompartilhouDados,
    param.gestorApresentouPontos,
    param.oQueSeraFeitoResultados,
    param.likeDeslike
  ];
  console.log("Array of Parameters without treatment:" + arrayParam);

  for (let i = 0; i < arrayParam.length; i++) {
    if (typeof arrayParam[i] == "undefined") {
      arrayParam[i] = '';
    }
  }

  console.log("arrayParam with treatment" + arrayParam);

  sendToSheet(arrayParam, agent);
}

function sendToSheet(array, agent) {
  let platformPayload = agent.originalRequest.payload;
  let senderId;

  if (platformPayload.source == "facebook") {
    senderId = platformPayload.data.sender.id;
    return FB.api(senderId, 'GET').then((response) => {
      array.unshift(senderId, response.name);

      var options = {
        method: 'POST',
        url: 'https://script.google.com/macros/s/AKfycbzyGebRp48PS7zLXhfb2vxX5MFHxoy088sz3063ISpU8ZJYMSQ/exec',
        json: true,
        body: {
          input: array
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
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
}
