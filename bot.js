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

const dispatcher = Dispatcher.getInstance();
const queue = Queue.getInstance();
const cache = Cache.getInstance();

let isRdy = true;

let cmd;
let args;

client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0 && ['1', '2', '3', '4', '5'].indexOf(message.content) === -1) {
    console.warn(['1', '2', '3', '4', '5'].indexOf(message.content) !== -1);
    return;
  }
  if (message.content.indexOf(config.prefix) !== 0) {
    cmd = message.content;
  } else {
    args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    cmd = args.shift().toLowerCase();
  }

  try {
    switch (cmd) {
      case 'play':
      /* NOTE play
       * checks arguments for youtube links and ids
       * plays the given song
       * if no argument given plays first out of queue or resumes paused song
       * TODO if multiple arguments are given plays first and adds the rest to queue
       */
        if (isRdy) {
          isRdy = false;
          Commands.play(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'add':
      /* NOTE add
       * checks arguments for youtube links and ids
       * adds the given songs to the queue
       */
        if (isRdy) {
          isRdy = false;
          Commands.add(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'queue':
      /* NOTE queue
       * displays the queue
       * if argument given displays x titles of the q
       */
        if (isRdy) {
          isRdy = false;
          Commands.queue(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'leave':
      /* NOTE leave
       * tries to leave the callers voiceChannel
       */
        if (isRdy) {
          isRdy = false;
          Commands.leave(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'join':
      /* NOTE join
       * tries to join the callers voiceChannel
       */
        if (isRdy) {
          isRdy = false;
          Commands.join(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'pause':
      /* NOTE pause
       * pauses song thats playing atm
       */
        if (isRdy) {
          isRdy = false;
          Commands.pause(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'continue':
      case 'resume':
      /* NOTE resume
       * resumes song thats paused atm
       */
        if (isRdy) {
          isRdy = false;
          Commands.resume(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'debug':
      /* NOTE debug
       * clears everything and leaved channels in order to get the bot unstuck
       * if rejoin or -r is given in the arguments it'll rejoin voice after getting unstuck
       */
        Commands.debug(args, message);
        console.log('done');
        isRdy = true;
        break;
      case 'emptyqueue':
      case 'clearqueue':
      case 'clearall':
      case 'empty':
      case 'clear':
      /* NOTE clear
       * clears queue
       */
        if (isRdy) {
          isRdy = false;
          Commands.clear(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'listcommands':
      case 'commands':
      case 'list':
      /* NOTE list
       * lists all documented commands // TODO and their functionallity
       */
        if (isRdy) {
          isRdy = false;
          Commands.list(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'find':
      case 'search':
      /* NOTE search
       * searches youtube for parameters and returns top 5
       */
        if (isRdy) {
          idRdy = false;
          Commands.search(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      case 'ping':
        const m = await message.channel.send('Ping?');
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      /* NOTE 1/2/3/4/5
       * TODO checks if cache for given number has title and puts them into queue
       */
        if (isRdy) {
          idRdy = false;
          Commands.addCached(args, message);
          console.log('done');
        }
        isRdy = true;
        break;
      default:
        console.log('LOG - default');
        break;
    }
  } catch (e) {
    console.log('ERROR - switch', e);
  }
});

client.login(process.env.TOKEN);
