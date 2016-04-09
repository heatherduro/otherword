'use strict';

const util = require('util');
const http = require('http');
const KikBot = require('@kikinteractive/kik');
const wordService = require('./app/services/words');

const port = process.env.PORT || 1337;

let wordCache = {};

// Configure the kik API endpoint, details for your kik
let kik = new KikBot({
  username: 'otherword',
  apiKey: 'cf47fd6a-3f2a-4fd2-bf12-31eb90d9ff95',
  baseUrl: 'otherword.azurewebsites.net'
});

// can't get this to fire
kik.onStartChattingMessage((message) => {
  kik.getUserProfile(message.from).then(user => {

    wordService.getRiddle().then(riddle => {
      wordCache[message.chatId] = riddle.word.toLowerCase();
      message.reply(`Hey ${user.firstName}! Are you ready to guess words based on definitions? Here comes the first:\n${riddle.challenge}`);
    }).catch(function(err) {
      message.reply("Something went wrong");
    });

  });
});
 
kik.onTextMessage((message) => {

  let lastWord = wordCache[message.chatId];
	let nextMessage = '';

	if(typeof lastWord !== 'undefined') {
		if(message.body.toLowerCase().includes(lastWord)){
			nextMessage = "Nice! \n";
		}
		else{
			nextMessage = "Sorry it was " + lastWord + ".\n";
		}
	}

  wordService.getRiddle().then(riddle => {
    lastWord[message.chatId] = riddle.word.toLowerCase();
    message.reply(`${nextMessage}\n${riddle.challenge}`);
  }).catch(function(err){
    message.reply("Something went wrong");
  });

});

// Set up your server and start listening
http.createServer(kik.incoming()).listen(port);

console.log(`Server listening on ${port}`);
