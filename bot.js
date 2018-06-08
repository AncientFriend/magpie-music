const Discord = require('discord.js');
const Ytdl = require('ytdl-core');
const Youtube = require('youtube-api')
const config = require('./config.json');
const request = require('snekfetch');

const BotHelper = require('./helpers/botHelper.js');
const Collections = require('./helpers/collections.js');
const strings = require('./helpers/strings.json');
const Commands = require('./helpers/commands.js');

const client = new Discord.Client();
const fs = require('fs');

const queue = [];

let files;
let isRdy = true;
let dispatcher;
let openConnection;

client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  switch (cmd) {
    case 'skip':
      try {
        dispatcher.destroy();
      } catch (e) {
        message.channel.send('nothing to cancel');
      }
      break;
    case 'add':
      queue.push(args[0]);
      console.log('LOG - queue', queue);
      break;
    case 'leave': {
      if (typeof voiceChannel === 'undefined') {
        message.channel.send('bye');
        message.member.voiceChannel.leave();
      } else {
        message.channel.send('im not in any voiceChannel atm');
      }
    }
      break;
    case 'join': {
      if (typeof voiceChannel === 'undefined') {
        message.member.voiceChannel.join()
        .then(() => {
          message.channel.send('hi there');
        });
      } else {
        message.channel.send('im not in any voiceChannel atm');
      }
    }
      break;
    case 'debug':
      console.log('debug started');
      BotHelper.search(args).then((response) => {
        message.channel.send(response);
      }).catch((err) => {
        console.log('ERR - in-bot.js',err);
      })
      break;
    case 'cancel':
      try {
        if (dispatcher) {
          queue.length = 0;
          dispatcher = dispatcher.destroy();
          message.channel.send(strings.cmds.cancel.success);
          isRdy = true;
        } else {
          message.channel.send(strings.cmds.cancel.error);
        }
      } catch (err) {
        message.channel.send(strings.cmds.cancel.error);
        console.log(err);
      }
      break;
    case 'pause':
      try {
        if (!dispatcher.paused) {
          dispatcher.pause();
          message.channel.send(strings.cmds.pause.success);
        } else {
          message.channel.send(strings.cmds.pause.done);
        }
      } catch (err) {
        message.channel.send(strings.cmds.pause.error);
        console.log(err);
      }
      break;
    case 'resume':
      try {
        if (dispatcher.paused) {
          dispatcher.resume();
          message.channel.send('resumed');
        } else {
          message.channel.send('already playing');
        }
      } catch (err) {
        message.channel.send('nothing to resume');
        console.log(err);
      }
      break;
    case 'play':
      if (isRdy) {
        isRdy = false;
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) {
          message.channel.send('I cant find your VoiceChannel');
          isRdy = true;
          return true;
        }
        try {
          openConnection = await voiceChannel.join();
          if (BotHelper.isYoutubeLink(args[0]) || Ytdl.validateID(args[0])) {
            dispatcher = openConnection.playStream(Ytdl(args[0], {filter: 'audioonly'}));
          } else if (BotHelper.isUrl(args[0])) {
            dispatcher = openConnection.playStream(args[0]);
          } else {
            files = fs.readdirSync(args[0]);
            files = files.filter(file => Collections.fileExtensions.includes(BotHelper.getFileEnding(file)));
            dispatcher = openConnection.playFile(args[0] + '/' + files[0]);
          }
          dispatcher.on('end', end => {
            console.log('LOG - end');
            if (queue.length === 0) {
              voiceChannel.leave();
              dispatcher = dispatcher.destroy;
              isRdy = true;
            } else {
              dispatcher = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
            }
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        queue.push(args[0]);
      }
      break;
    case 'ping':
      const m = await message.channel.send('Ping?');
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
      break;
    case 'say':
      const sayMessage = args.join(' ');
      message.delete().catch(O_o => {});
      message.channel.send(sayMessage);
      break;
    default:
      message.channel.send('sry i dont understand that try one of these:' + Collections.commands);
  }
});

client.login(config.token);
