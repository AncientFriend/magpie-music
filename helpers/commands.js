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
      const conn1 = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
      dispatcher.setDispatcher(conn1);
    } else {
      if (BotHelper.isYoutubeLink(args[0]) || Ytdl.validateID(args[0])) {
        const conn2 = openConnection.playStream(Ytdl(args[0], {filter: 'audioonly'}));
        dispatcher.setDispatcher(conn2);
      } else {
        console.log('not good');
      }
    }
    dispatcher.on('end', end => {
      console.log('LOG - end of song');
      if (queue.length === 0) {
        voiceChannel.leave();
        const conn3 = dispatcher.destroy;
        dispatcher.setDispatcher(conn3);
        isRdy = true;
      } else {
        const conn4 = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
        dispatcher.setDispatcher(conn4);
      }
    });
  } catch (err) {
    console.log('ERROR - catch', err);
  }
};
