'use strict';

const RestClient = require('node-rest-client').Client;
const API_KEY = require('../../local/wordnik_api_key.json').key;

class Words {

  constructor() {

    this.restClient = new RestClient();

    this.client = {};
    this.wordnik = {
      apiKey: API_KEY,
      api: {
        base: 'http://api.wordnik.com:80/v4/',
        word: 'word.json',
        words: 'words.json',
        randomWord: 'words.json/randomWord?hasDictionaryDef=true&minCorpusCount=100000&maxCorpusCount=-1&minDictionaryCount=5&excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&maxDictionaryCount=-1&minLength=3&maxLength=-1',
        definition: 'word.json/{word}/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false'
      }
    };

    this.buildEndpoints();

  }

  // API Client wrapper
  fetch(url) {
    return new Promise((resolve,reject) => {
      this.restClient.get(url, (data, response) => {
        resolve({data, response});
      }).on('error', reject);
    }).catch(e => {
      throw e;
    });
  }

  // builds full URI's from endpoint data
  buildEndpoints() {

    var apiData = this.wordnik.api;

    // prefix base url on api routes
    Object.keys(apiData).map(uri => {

      if (uri === 'base') {
        return;
      }

      // build full URI's
      apiData[uri] = `${this.wordnik.api.base}${this.wordnik.api[uri]}`;
      let querySlug = apiData[uri].indexOf('?') !== -1 ? '&' : '?';
      apiData[uri] =  `${apiData[uri]}${querySlug}api_key=${this.wordnik.apiKey}`;

    });

  }

  // fetches a random word
  randomWord() {

    return this.fetch(this.wordnik.api.randomWord).then(payload => {

      if (payload.response.statusCode !== 200) {
        throw 'Error getting random word!';
      }

      if (!payload.data.word) {
        payload.data.word = null;
      }

      return payload.data.word;

    });

  }

  // fetches a words defintion
  getDefinition(word) {

    if (!word || !word.length) {
      throw `Invalid word: ${word}`
    }

    // sometimes the definition contains examples of use, need to hide those.
    let cleanResponse = responseText => {
      // the examples appear after a colon
      let parts = responseText.split(':');
      if (parts.length > 1){
        for (let i = 1; i < parts.length; i++) {
          // replace the examples with ####
          parts[0] += ':' + parts[i].replace(new RegExp(responseText,'g'),'####');
        }
      }
      return parts[0];
    };

    return this.fetch(this.wordnik.api.definition.replace('{word}', word)).then(result => {

        if (!result.data.length || !result.data[0].text) {
          throw 'No Definition found for word: ' + word;
        }

        return {
          word: word,
          challenge: cleanResponse(result.data[0].text)
        };

      });

  }

  // gets a random word and definition
  getRiddle() {

    return this.randomWord().then(word => {
      return this.getDefinition(word);
    });

  }

}

module.exports = new Words();
