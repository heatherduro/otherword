'use strict';
 
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let Client = require('node-rest-client').Client;

let wordnikBaseAPI = "http://api.wordnik.com:80/v4/";
let wordnikWordAPI = "word.json/";
let wordnikWordsAPI = "words.json/";
let wordnikRandomWordAPI = "randomWord?hasDictionaryDef=true&minCorpusCount=100000&maxCorpusCount=-1&minDictionaryCount=5&excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&maxDictionaryCount=-1&minLength=3&maxLength=-1";
let wordnikDefinitionAPI = "/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false";
let wordnikAPIkey = "&api_key=3b3cbcfaf00303d5360070ca0c10c20870357f872b1499516";

let port = process.env.PORT || 1337; 
// Configure the bot API endpoint, details for your bot 
let bot = new Bot({
    username: 'otherword',
    apiKey: 'cf47fd6a-3f2a-4fd2-bf12-31eb90d9ff95',
    baseUrl: 'otherword.azurewebsites.net'
});

 
let client = new Client();

let lastWord = {};

function cleanDefn(riddle){
	return riddle.def.replace(new RegExp(riddle.word,'g'),'####')
}

function getWord() {

	return new Promise(function(resolve, reject) {
		client.get(wordnikBaseAPI + wordnikWordsAPI + wordnikRandomWordAPI + wordnikAPIkey, function(data, response) {
			let word = data.word;
			client.get(wordnikBaseAPI + wordnikWordAPI + word + wordnikDefinitionAPI + wordnikAPIkey, function(defData, defResponse){
				resolve({word: word, def: defData[0].text})
			}).on('error', reject);
		}).on('error', reject);
	});
} 

bot.onStartChattingMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
        	getWord().then((riddle) => {
        		lastWord[message.chatId] = riddle.word.toLowerCase();
            	message.reply("Hey ${user.firstName}! Are you readuy to guess words based on definitons? Here comes the first: " + cleanDefn(riddle));
        	}).catch(function(err){
        		message.reply("Something went wrong");
        	});
        });
});
 
bot.onTextMessage((message) => {
	let lw = lastWord[message.chatId]
	if(message.body.toLowerCase().includes(lw)){
		message.reply("Nice!");
	}
	else{
		message.reply("Sorry it was " + lw);
	}

	getWord().then((riddle) => {
		lastWord[message.chatId] = riddle.word.toLowerCase();
		message.reply(cleanDefn(riddle));
	}).catch(function(err){
		message.reply("Something went wrong");
	});
    
});

// Set up your server and start listening
let server = http
    .createServer(bot.incoming())
    .listen(port);