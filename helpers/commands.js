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
      const conn = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
      dispatcher.setDispatcher(conn);
    } else {
      if (BotHelper.isYoutubeLink(args[0]) || Ytdl.validateID(args[0])) {
        const conn = openConnection.playStream(Ytdl(args[0], {filter: 'audioonly'}));
        dispatcher.setDispatcher(conn);
      } else {
        console.log('not good');
      }
    }
    dispatcher.on('end', end => {
      console.log('LOG - end of song');
      if (queue.length === 0) {
        voiceChannel.leave();
        const conn = dispatcher.destroy;
        dispatcher.setDispatcher(conn);
        isRdy = true;
      } else {
        const conn = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
      }
    });
  } catch (err) {
    console.log('ERROR - catch', err);
  }
};
