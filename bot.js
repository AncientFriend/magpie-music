const Discord = require('discord.js');
const Ytdl = require('ytdl-core');
const Youtube = require('youtube-api');
const config = require('./config.json');
const request = require('snekfetch');

const BotHelper = require('./helpers/botHelper.js');
const Collections = require('./helpers/collections.js');
const strings = require('./helpers/strings.json');
const Commands = require('./helpers/commands.js');
const Dispatcher = require('./singletons/dispatcher');
const Queue = require('./singletons/queue');
const Cache = require('./singletons/cache');

const client = new Discord.Client();
const fs = require('fs');

const queue = Queue.getInstance();
const cache = Cache.getInstance();

let isRdy = true;

client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let cmd = args.shift().toLowerCase();

  try {
    switch (cmd) {
      case 'play':
        if (isRdy) {
          isRdy = false;
          Commands.play(args, message);
        }
        console.log('done');
        isRdy = true;
        break;
      case 'add':
        queue.addToQueue('entry01');
        break;
      default:
        console.log('LOG - default');
        break;
    }
  } catch (e) {
    console.log('ERROR - switch', e);
  }
});

client.login(config.token);
