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
  console.warn('Play');
  let openConnection;
  let conn;
  try {
    let voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send(strings.cmds.play.errorNotFound);
      isRdy = true;
      return true;
    }
    openConnection = await voiceChannel.join();
    playSong(args[0], openConnection);
  } catch (e) {
    console.log('ERROR - catch', err);
  }
};

module.exports.add = async (args, message) => {
  try {
    args.forEach((argument, index) => {
      if (BotHelper.isYoutubeLink(argument) || Ytdl.validateID(argument)) {
        getInfo(argument);
        queue.addToQueue(argument);
      } else {
        const post = (index === 0) ? 'st' : 'ed';
        message.channel.send('for the ' + (index + 1) + post + ' argument no source could be found');
      }
    });
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.queue = async (args, message) => {
  try {
    let response = queue.getQueue();
    if (args[0]) response.length = args[0];
    message.channel.send(response);
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.leave = async (args, message) => {
  try {
    let voiceChannel = message.member.voiceChannel;
    if (voiceChannel) {
      console.warn('1', voiceChannel);
      try {
        console.warn('2');
        voiceChannel.leave();
      } catch (e) {
        console.log('ERROR - e', e);
      } finally {

      }
    }
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

playSong = (song, connection) => {
  console.warn('Playsong');
  try {
    if (BotHelper.isYoutubeLink(song) || Ytdl.validateID(song)) {
      const conn = connection.playStream(Ytdl(song, {filter: 'audioonly'}));
      dispatcher.setDispatcher(conn);
    } else {
      console.log('please use youtubelinks or id\'s');
    }
  } catch (e) {
    console.log('ERROR - catch', e);
  }
  dispatcher.on('end', end => {
    if (!queue.isEmpty()) {
      playSong(queue.getNextTitle(), connection);
    } else {
      dispatcher.leave();
    }
    // leave if no queue else next song
  });
};

getInfo = async (data) => {
  // TODO
  try {
    let url;
    if (BotHelper.isYoutubeLink(data)) {
      url = 'https://www.googleapis.com/youtube/v3/videos?url=' + data + '&part=contentDetails&key=' + config.Api_Key;
    } else if (Ytdl.validateID(data)) {
      url = 'https://www.googleapis.com/youtube/v3/videos?id=' + data + '&part=contentDetails&key=' + config.Api_Key;
    }

    response = await request.get(url);
    console.warn('LOG - request', request);
  } catch (e) {
    console.log('ERROR - catch', e);
  }
  // 'https://www.googleapis.com/youtube/v3/videos?url=' + url + '&part=contentDetails&key='{YOUR_API_KEY}
};
