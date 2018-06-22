const Dispatcher = require('../singletons/dispatcher');
const Queue = require('../singletons/queue');
const Ytdl = require('ytdl-core');
const Youtube = require('youtube-api');
const config = require('../config.json');
const request = require('snekfetch');
const BotHelper = require('./botHelper.js');

const dispatcher = Dispatcher.getInstance();
const queue = Queue.getInstance();

module.exports.play = async (args, message) => {
  let voiceChannel = message.member.voiceChannel;
  if (!voiceChannel) {
    message.channel.send(strings.cmds.play.errorNotFound);
    isRdy = true;
    return true;
  }
  try {
    openConnection = await voiceChannel.join();
    if (args.length === 0 && queue.length > 0) {
      dispatcher.setDispatcher(openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'})));
    } else {
      if (BotHelper.isYoutubeLink(args[0]) || Ytdl.validateID(args[0])) {
        dispatcher.setDispatcher(openConnection.playStream(Ytdl(args[0], {filter: 'audioonly'})));
      } else {
        console.log('not good');
      }
    }
    dispatcher.on('end', end => {
      console.log('LOG - end of song');
      if (queue.length === 0) {
        voiceChannel.leave();
        dispatcher.setDispatcher(dispatcher.destroy);
        isRdy = true;
      } else {
        dispatcher.setDispatcher(openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'})));
      }
    });
  } catch (err) {
    console.log('ERROR - catch', err);
  }
};
