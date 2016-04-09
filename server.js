'use strict';

const util = require('util');
const http = require('http');
const KikBot = require('@kikinteractive/kik');
const wordService = require('./app/services/words');

const API_KEY = require('../local/API_KEYS.json').kik;

const port = process.env.PORT || 1337;

let wordCache = {};

// Configure the kik API endpoint, details for your kik
let kik = new KikBot({
  username: 'otherword',
  apiKey: API_KEY,
  baseUrl: 'otherword.azurewebsites.net'
});

// can't get this to fire
kik.onStartChattingMessage(message => {

  return kik.getUserProfile(message.from).then(user => {

    wordService.getRiddle().then(riddle => {
      wordCache[message.chatId] = riddle.word.toLowerCase();
      message.reply(`Hey ${user.firstName}! Are you ready to guess words based on definitions? Here comes the first:\n${riddle.challenge}`);
    }).catch(function(err) {
      message.reply("Something went wrong");
    });

  });

});

kik.onTextMessage(message => {

  let correctWord = wordCache[message.chatId];
  let nextMessage = `Sorry it was ${correctWord}\n`;

  if (typeof correctWord === 'undefined' && message.body && message.body.toLowerCase().includes(correctWord)) {
    nextMessage = `Well done! ${correctWord} is correct!\n`;
  }

  wordService.getRiddle().then(riddle => {
    wordCache[message.chatId] = riddle.word.toLowerCase();
    message.reply(`${nextMessage}\n${riddle.challenge}`);
  }).catch(function(err){
    message.reply("Something went wrong");
  });

});

// Set up your server and start listening
http.createServer(kik.incoming()).listen(port);

console.log(`Server listening on ${port}`);
