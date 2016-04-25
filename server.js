'use strict';

const util = require('util');
const http = require('http');
const KikBot = require('@kikinteractive/kik');
const wordService = require('./app/services/words');

const port = process.env.PORT || 1337;

let wordCache = {};

// Configure the kik API endpoint, details for your kik
let kik = new KikBot({
  username: 'peteristhebesttho',
  apiKey: process.env.KIK_API_KEY,
  baseUrl: 'safe-thicket-93320.herokuapp.com'
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
  let nextMessage = '';

  if(typeof correctWord !== 'undefined' ){
    if (message.body && message.body.toLowerCase().includes(correctWord)) {
      nextMessage = `Well done! ${correctWord} is correct!\n\n`;
    }
    else{
      nextMessage = `Sorry, the answer was ${correctWord}\n\n`;
    }
  }

  wordService.getRiddle().then(riddle => {
    wordCache[message.chatId] = riddle.word.toLowerCase();
    message.reply(`${nextMessage}${riddle.challenge}`);
  }).catch(function(err){
    message.reply("Something went wrong");
  });

});

// Set up your server and start listening
http.createServer(kik.incoming()).listen(port);

console.log(`Server listening on ${port}`);
