/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');
const i18n = require('i18next');	
const sprintf = require('i18next-sprintf-postprocessor');

const LaunchRequest = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speechOutput = `${requestAttributes.t('WELCOME_MESSAGE')}. ${requestAttributes.t('HELP_MESSAGE')}`;
    const reprompt = requestAttributes.t('HELP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speechOutput = requestAttributes.t('GOODBYE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speechOutput = requestAttributes.t('HELP_MESSAGE');
    const reprompt = requestAttributes.t('HELP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const NumberGuessIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'NumberGuessIntent';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const requestAttributes = attributesManager.getRequestAttributes();

    const guessNum = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value, 10);
    const sessionAttributes = attributesManager.getSessionAttributes();
    let targetNum = sessionAttributes.guessNumber;
    if(!targetNum){
      sessionAttributes.guessNumber = Math.floor(Math.random() * 101);
      targetNum = sessionAttributes.guessNumber;
    }

    if (guessNum > targetNum) {
      return handlerInput.responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('TOO_HIGH')}. ${requestAttributes.t('SAY_LOWER')}.`)
        .reprompt(requestAttributes.t('SAY_LOWER'))
        .getResponse();
    } else if (guessNum < targetNum) {
      return handlerInput.responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('TOO_LOW')}. ${requestAttributes.t('SAY_HIGHER')}.`)
        .reprompt(requestAttributes.t('SAY_HIGHER'))
        .getResponse();
    } else if (guessNum === targetNum) {
      attributesManager.setSessionAttributes(sessionAttributes);
      return handlerInput.responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('CORRECT')} ${requestAttributes.t('GOODBYE')}`)
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR'))
      .reprompt(requestAttributes.t('ERROR'))
      .getResponse();
  }
}

const UnhandledIntent = {
  canHandle(handlerInput) {
    return true;
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    console.log(JSON.stringify(handlerInput.requestEnvelope));
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR'))
      .reprompt(requestAttributes.t('ERROR'))
      .getResponse();
  }
}

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      fallbackLng: 'en',
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageString,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    }
  }
}

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequestHandler,
    HelpIntent,
    NumberGuessIntent,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .lambda();


  const languageString = {
    en: {
      translation: {
        SKILL_NAME: 'Number Guessing Game',
        WELCOME_MESSAGE: 'Welcome to the number guessing game',
        HELP_MESSAGE: 'Please guess my number between 0 and 100',
        GOODBYE: 'Thanks for playing and goodbye!',
        TOO_HIGH: 'is too high!',
        TOO_LOW: 'is too low!',
        SAY_HIGHER: 'Please say a higher number',
        SAY_LOWER: 'Please say a lower number',
        CORRECT: 'is right!',
        ERROR: 'Sorry, I didn\'t catch that. Please say a number'
      }
    },
    es: {
      translation: {
        SKILL_NAME: 'Juego de Adivinar el Número',
        WELCOME_MESSAGE: 'Bienvenido al juego de adivinar el número',
        HELP_MESSAGE: 'Por favor adivina en que número del 0 al 100 estoy pensando',
        GOODBYE: 'Gracias por jugar y hasta pronto!',
        TOO_HIGH: 'es muy alto!',
        TOO_LOW: 'es muy bajo!',
        SAY_HIGHER: 'Dime un número más alto',
        SAY_LOWER: 'Dime un número más bajo',
        CORRECT: 'es correcto!',
        ERROR: 'Lo siento, no te he entendido. Por favor dime un número'
      }
    },
    it:{
      translation: {
        SKILL_NAME: 'Gioco di Indovinare il Numero',
        WELCOME_MESSAGE: 'Benvenuto al gioco di indovinare il numero.',
        HELP_MESSAGE: 'Per favore per favore indovina quale numero de 1 a 100 sto pensando',
        GOODBYE: 'Grazie per giocare e arrivederci!',
        TOO_HIGH: ' è troppo alto!',
        TOO_LOW: ' è troppo basso!',
        SAY_HIGHER: 'Dimmi un numero piu alto.',
        SAY_LOWER: 'Dimmi un numero piu basso.',
        CORRECT: ' è corretto!',
        ERROR: 'Mi dispiace, non ho capito. Per favore dimi un numero'
      }
    }
  }