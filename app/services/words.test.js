const wordService = require('./words');

var wordCache = {};

var user = {
  firstName: 'Brian'
};

var message = {
  chatId: 1
};


wordService.getRiddle().then(riddle => {
  console.log('[BPJW]: riddle', riddle);
  wordCache[message.chatId] = riddle.word.toLowerCase();
  console.log( `Hey ${user.firstName}! Are you ready to guess words based on definitions? Here comes the first: ${riddle.challenge}`);
}).catch(function(err) {
  console.error(err);
});
