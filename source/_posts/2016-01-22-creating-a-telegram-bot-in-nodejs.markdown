---
layout: post
title: "Creating a Telegram bot in NodeJS"
date: 2016-01-22 22:25:58 -0300
comments: true
categories: [telegram, nodejs] 
---
Hi there, people and fellow bots! In this tutorial, I'll show you how to create a Telegram bot in NodeJS framework (that I consider the easiest approach). 

If you live in the cave and DON'T know what Telegram is, I'll tell you: [Telegram](https://telegram.org/) is an awesome multi-platform messaging app. More than that, it's an (partially) open source infrastructure for developers to design their own instant messaging apps.

<!-- more -->
Very well, let's start. The first step is to set a new bot account. And... there's also a bot responsible for it. On Telegram, search for @BotFather.


->![](/images/posts/telegram1.png)<-

Let's start it. By clicking on start button, the bot will give you a set of commands. The next steps are pretty straight-forward. Type /newbot. You will be asked to name it. You can name it whatever you want, obviously. Remember that this is the display name, not the username, so whitespaces are allowed.

> I'm going to name mine "InsulterBot", because I like to insult people, having a bot to do this repetitive job for me will save me a lot of time!

You will then be prompted to type the bot username. This time, no whitespaces are allowed and it must end on "bot". 

> Sadly, "insulterbot" was already taken, so I had to choose "thebestinsulterbot" instead. 

Well, that's it! It will inform you a token. **Keep it**! Now let's get our hands dirty, shall we?

The very first thing we need to do is to get a server (preferably free) to host our bot. I strongly recommend [OpenShift](https://www.openshift.com/), due to some good past experiences. 

Setting a new NodeJS application on OpenShift is very, very simple. All you need to do is create an account (it's free!), provide your public SSH key (located on ~/.ssh/id_rsa.pub) and then click on "Add Application..." button. 

After that, select "Node.js 0.10" on "Other types" category.

Once you have created the application, clone its repository, enter it and install the telegram node module through the command:

``` Bash 
npm install node-telegram-bot-api
```

This is a module created by [@yagop](https://github.com/yagop/node-telegram-bot-api) that wraps some stuff so we don't need to worry about it.

Now open the "server.js" file that came with your repository. Delete all its content, we aren't going to need it anyway. We can safely copy/paste the example inside the node-telegram-bot-api repository:

``` Javascript server.js
var TelegramBot = require('node-telegram-bot-api');

var token = 'YOUR_TELEGRAM_BOT_TOKEN';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  var photo = 'cats.png';
  bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});
``` 

Pay attention to the value of variable "token". You must replace it with the token that the BotFather gave.

Notice that there are two listeners on our example. The first one listens to when a user type a text that matches the regex ```/\/echo (.*)/``` (that's precisely /echo ANYTHING), and will send back to the user (through the "sendMessage" method) the same message that it received. But before sending it, we need first to know for which user id the message will be sent. 

The first parameter of the callback (msg) is a variable of type Message, documented [here](https://core.telegram.org/bots/api#message). Through it we can access many informations about the message and the sender of the message itself. In the 'echo' example, we are getting the sender (through the "from" field, that returns an object of type [User](https://core.telegram.org/bots/api#user)) and then its id (through the "id" field), and use it to inform to the bot to which user it must send the message. 

The second listener works in a similar way, but instead of listening to a specific command, it listens to any message and sends back to the user the picture of a lovely kitten.

In my specific case of InsulterBot, I'm just going to need one single listener listening to the /insult command, that replies to the user a random insult. This can be easily taking the 'echo' listener as example.

``` Javascript server.js
bot.onText(/\/insult/, function(msg, match) {
	var fromId = msg.from.id;
	var insults = ["Dumbass", "Out of 100,000 sperm, you were the fastest?", "Look, you aint funny. Your life is just a joke."];
	var chosenInsult = insults[Math.floor(Math.random() * insults.length)];
	bot.sendMessage(fromId, chosenInsult);
});
```

Well, that's basically it. :D 

Just a little more thing: It's a good pratice to include a /help command to your bot so users will know which commands are available.

``` Javascript server.js
bot.onText(/\/help/, function(msg, match) {
	var fromId = msg.from.id;
	bot.sendMessage(fromId, "This spectacular bot just have one single command.\n/insult - Insult you.");
});
```

Full code:
``` Javascript server.js

var TelegramBot = require('node-telegram-bot-api');

var token = 'YOUR_TELEGRAM_BOT_TOKEN';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/insult/, function(msg, match) {
  var fromId = msg.from.id;
  var insults = ["Dumbass", "Out of 100,000 sperm, you were the fastest?", "Look, you aint funny. Your life is just a joke."];
  var chosenInsult = insults[Math.floor(Math.random() * insults.length)];
  bot.sendMessage(fromId, chosenInsult);
});

bot.onText(/\/help/, function(msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, "This spectacular bot just have one single command.\n/insult - Insult you.");
});
```

Now we just need to git push the modifications to deploy our bot to the server (don't worry if a message of failure pops up. It happens because we aren't listening to any port (neither we need to)).

->![](/images/posts/telegram3.png)<-
