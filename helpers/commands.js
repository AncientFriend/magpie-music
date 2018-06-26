const Dispatcher = require('../singletons/dispatcher');
const Cache = require('../singletons/cache');
const Queue = require('../singletons/queue');
const Ytdl = require('ytdl-core');
const Youtube = require('youtube-api');
const config = require('../config.json');
const request = require('snekfetch');
const BotHelper = require('./botHelper.js');

const dispatcher = Dispatcher.getInstance();
const queue = Queue.getInstance();
const cache = Cache.getInstance();

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
    dispatcherIsPaused = dispatcher.getPaused();
    queueIsEmpty = queue.isEmpty();

    if (dispatcherIsPaused) {
      dispatcher.resume();
    } else if (args.length > 0) {
      playSong(args[0], openConnection);
    } else if (!queueIsEmpty) {
      playSong(queue.getNextTitle(), openConnection);
    } else {
      console.log('queue is empty and no arguments given');
    }
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.add = async (args, message) => {
  try {
    args.forEach((argument, index) => {
      if (BotHelper.isYoutubeLink(argument) || Ytdl.validateID(argument)) {
        // getInfo(argument);
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
    const voiceChannel = message.member.voiceChannel;
    if (voiceChannel) {
      try {
        voiceChannel.leave();
      } catch (e) {
        console.log('ERROR - e', e);
      }
    }
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.join = async (args, message) => {
  try {
    let voiceChannel = message.member.voiceChannel;
    if (voiceChannel) {
      try {
        voiceChannel.join();
      } catch (e) {
        console.log('ERROR - e', e);
      }
    }
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.pause = async (args, message) => {
  try {
    dispatcher.pause();
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.resume = async (args, message) => {
  try {
    dispatcher.resume();
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

module.exports.debug = async (args, message) => {
  try {
    dispatcher.setDispatcher();
    cache.setCache();
    queue.clear();
    message.member.voiceChannel.leave();
    if (args[0] === 'rejoin' || args[0] === '-r') message.member.voiceChannel.join();
  } catch (e) {
    console.log('ERROR - catch', e);
  }
};

playSong = (song, connection) => {
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
      connection.channel.leave();
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
