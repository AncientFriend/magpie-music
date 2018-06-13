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

let cache;
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
  if (message.content.indexOf(config.prefix) !== 0 &&
      message.content !== '1' &&
      message.content !== '2' &&
      message.content !== '3' &&
      message.content !== '4' &&
      message.content !== '5') return;

  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let cmd = args.shift().toLowerCase();

  if(message.content === '1' ||
  message.content === '2' ||
  message.content === '3' ||
  message.content === '4' ||
  message.content === '5') {
    if(cache[message.content] !== undefined) {
      cmd = 'play'
      console.log(cache);
      args = [cache[parseInt(message.content) -1].id]
    }
  }

  switch (cmd) {
    case 'skip':
      try {
        dispatcher.destroy();
      } catch (e) {
        message.channel.send(strings.cmds.skip.error);
      }
      break;
    case 'add':
      queue.push(args[0]);
      console.log('LOG - queue', queue);
      break;
    case 'leave': {
      if (typeof voiceChannel === 'undefined') {
        message.channel.send(strings.cmds.leave.success);
        message.member.voiceChannel.leave();
      } else {
        message.channel.send(strings.cmds.leave.error);
      }
    }
      break;
    case 'join': {
      if (typeof message.member.voiceChannel !== 'undefined') {
        message.member.voiceChannel.join()
        .then(() => {
          message.channel.send(strings.cmds.join.success);
        });
      } else {
        message.channel.send(strings.cmds.join.error);
      }
    }
      break;
    case 'debug':
      console.log('debug started');
      BotHelper.search(args).then((response) => {
        cache = response.cache
        message.channel.send(response.output);
      }).catch((err) => {
        console.log('ERR - in-bot.js',err);
      })
      break;
    case 'cancel':
      try {
        console.log(dispatcher);
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
          message.channel.send(strings.cmds.resume.success);
        } else {
          message.channel.send(strings.cmds.resume.done);
        }
      } catch (err) {
        message.channel.send(strings.cmds.resume.error);
        console.log(err);
      }
      break;
    case 'play':
      if (isRdy) {
        isRdy = false;
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) {
          message.channel.send(strings.cmds.play.errorNotFound);
          isRdy = true;
          return true;
        }
        try {
          openConnection = await voiceChannel.join();
          if (args.length === 0 && queue.length > 0) {
            dispatcher = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
          } else {
            if (BotHelper.isYoutubeLink(args[0]) || Ytdl.validateID(args[0])) {
              dispatcher = openConnection.playStream(Ytdl(args[0], {filter: 'audioonly'}));
            } else if (BotHelper.isUrl(args[0])) {
              dispatcher = openConnection.playStream(args[0]);
            } else {
              files = fs.readdirSync(args[0]);
              files = files.filter(file => Collections.fileExtensions.includes(BotHelper.getFileEnding(file)));
              dispatcher = openConnection.playFile(args[0] + '/' + files[0]);
            }
          }
          dispatcher.on('end', end => {
            console.log('LOG - end of song');
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
        message.channel.send(strings.cmds.play.success)
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
      message.channel.send(strings.cmds.collection.success + Collections.commands);
  }
});

client.login(config.token);
