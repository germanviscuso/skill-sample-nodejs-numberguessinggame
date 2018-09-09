/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');
const i18n = require('i18next');	
const sprintf = require('i18next-sprintf-postprocessor');

const languageStrings = {
  'en' : require('./i18n/en'),
  'en-GB' : require('./i18n/en-GB'),
  'es' : require('./i18n/es'),
  'es-MX' : require('./i18n/es-MX'),
  'it' : require('./i18n/it')
}

const LaunchRequest = {
  canHandle(handlerInput) {
    const {request} = handlerInput.requestEnvelope;
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
    const {request} = handlerInput.requestEnvelope;
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
    const {request} = handlerInput.requestEnvelope;
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
    const {request} = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'NumberGuessIntent';
  },
  handle(handlerInput) {
    const {attributesManager} = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const guessNum = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value, 10);
    const sessionAttributes = attributesManager.getSessionAttributes();
    let targetNum = sessionAttributes.guessNumber;
    if(!targetNum){
      sessionAttributes.guessNumber = Math.floor(Math.random() * 101);
      targetNum = sessionAttributes.guessNumber;
    }

    const {responseBuilder} = handlerInput;
    if (guessNum > targetNum) {
      responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('TOO_HIGH')}. ${requestAttributes.t('SAY_LOWER')}.`)
        .reprompt(requestAttributes.t('SAY_LOWER'));
    } else if (guessNum < targetNum) {
      responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('TOO_LOW')}. ${requestAttributes.t('SAY_HIGHER')}.`)
        .reprompt(requestAttributes.t('SAY_HIGHER'));
    } else if (guessNum === targetNum) {
      attributesManager.setSessionAttributes(sessionAttributes);
      responseBuilder
        .speak(`${guessNum.toString()} ${requestAttributes.t('CORRECT')} ${requestAttributes.t('GOODBYE')}`);
    } else {
      responseBuilder
        .speak(requestAttributes.t('ERROR'))
        .reprompt(requestAttributes.t('ERROR'));
    }
    return responseBuilder.getResponse();
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
      resources: languageStrings,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    }
  }
}

const LocalizationInterceptorWithArraySupport = {
  process(handlerInput) {
      const localizationClient = i18n.use(sprintf).init({
          lng: handlerInput.requestEnvelope.request.locale,
          fallbackLng: 'en',
          resources: languageStrings
      });

      localizationClient.localize = function () {
          const args = arguments;
          let values = [];

          for (var i = 1; i < args.length; i++) {
              values.push(args[i]);
          }
          const value = i18n.t(args[0], {
              returnObjects: true,
              postProcess: 'sprintf',
              sprintf: values
          });

          if (Array.isArray(value)) {
              return value[Math.floor(Math.random() * value.length)];
          } else {
              return value;
          }
      }

      const attributes = handlerInput.attributesManager.getRequestAttributes();
      attributes.t = function (...args) { // pass on arguments to the localizationClient
          return localizationClient.localize(...args);
      };
  },
};

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
  .addRequestInterceptors(LocalizationInterceptorWithArraySupport)
  .lambda();
