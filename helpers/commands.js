const Dispatcher = require('../singletons/dispatcher');
const Cache = require('../singletons/cache');
const Queue = require('../singletons/queue');
const Ytdl = require('ytdl-core');
const Youtube = require('youtube-api');
const config = require('../config.json');
const request = require('snekfetch');
const BotHelper = require('./botHelper.js');
const moment = require('moment');
const Collections = require('./collections.js');
const base64 = require('base-64');

const dispatcher = Dispatcher.getInstance();
const queue = Queue.getInstance();
const cache = Cache.getInstance();

module.exports.play = async (args, message) => {
  console.warn('Play');
  try {
    let openConnection;
    let conn;
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
    } else if (!queue.isEmpty()) {
      playSong(queue.getNextTitle().id, openConnection);
    } else {
      console.log('queue is empty and no arguments given');
    }
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.add = (args, message) => {
  try {
    args.forEach((argument, index) => {
      const id = argument.includes('you') ? getId(argument) : argument;
      if (id) {
        getInfo(id, message)
        .then((obj) => {
          if (!queue.addToQueue(obj)) {
            message.channel.send('max length');
            throw new Error();
          }
        });
      } else {
        const post = (index === 0) ? 'st' : 'ed';
        message.channel.send('for the ' + (index + 1) + post + ' argument no source could be found');
      }
    });
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.queue = async (args, message) => {
  try {
    const queueArr = queue.getQueue();
    if (args[0]) queueArr.length = args[0];
    let playTime = 0;
    let response = '';
    queueArr.forEach((song, index) => {
      playTime += moment.duration(song.isoTime).as('milliseconds');
      if (index >= 10) return;
      const title = song.title.substring(0, 40);
      response += '`' + (title.length < 40 ? title + ' '.repeat(43 - title.length) : title + '...') + '\t' +
      song.duration + '`\n';
    });
    if (response.length > 1) {
      response = moment.duration(playTime).humanize() + '\n' + response + '\nand ' + (queueArr.length - 10) + ' more';
    } else {
      response = 'it seems to be empty..';
    }
    message.channel.send(response);
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
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
    console.log('ERROR - catch', arguments.callee.name, e);
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
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.pause = async (args, message) => {
  try {
    dispatcher.pause();
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.resume = async (args, message) => {
  try {
    dispatcher.resume();
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.clear = async (args, message) => {
  try {
    queue.clear();
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.list = async (args, message) => {
  try {
    message.channel.send(Collections.commands);
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.search = async (args, message) => {
  try {
    const searchResult = await BotHelper.search(args);
    cache.setCache(searchResult.cache);
    message.channel.send(searchResult.output);
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.addCached = async (message) => {
  try {
    const cachedValues = cache.getCache();
    cachedValues.forEach((item, index) => {
      if (message.content == item.index + 1) {
        return getInfo(item.id, message)
        .then((info) => {
          queue.addToQueue(info);
          message.channel.send('added \'' + info.title + '\' to the playlist');
          cache.clearCache();
        });
      }
    });
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
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
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.export = async (message) => {
  try {
    const q = queue.getQueue();
    let exportList = [];
    q.forEach((item) => {
      exportList.push(item.id);
    });
    const code = base64.encode(JSON.stringify(exportList));
    code.match(/.{1,1500}/g).forEach(text => {
      message.author.send(text);
    });
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.import = async (message, args) => {
  try {
    const input = args.join(' ');
    const list = JSON.parse(base64.decode(input));
    this.add(list, message);
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

playSong = (song, connection) => {
  try {
    const id = getId(song);
    if (id) {
      const conn = connection.playStream(Ytdl(id, {filter: 'audioonly'}));
      dispatcher.setDispatcher(conn);
    } else {
      console.log('please use youtubelinks or id\'s');
    }
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
  dispatcher.on('end', end => {
    if (!queue.isEmpty()) {
      playSong(queue.getNextTitle().id, connection);
    } else {
      connection.channel.leave();
    }
  });
};

getInfo = async (data, message) => {
  // TODO
  try {
    let url;
    url = 'https://www.googleapis.com/youtube/v3/videos?id=' + data + '&part=contentDetails&key=' + process.env.API_KEY;
    const timeResponse = await request.get(url);
    const isoTime = timeResponse.body.items[0].contentDetails.duration;
    let duration = convertTime(isoTime);
    url = 'https://www.googleapis.com/youtube/v3/videos?id=' + data + '&key=' + process.env.API_KEY + '&part=snippet';
    const dataResponse = await request.get(url);
    let title = dataResponse.body.items[0].snippet.title;
    let requester = message.member.user.username;

    return createQueueObject(title, duration, requester, data, isoTime);
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

createQueueObject = (title, duration, requester, id, isoTime) => {
  return {
    title,
    duration,
    requester,
    id,
    isoTime
  };
};

getId = (url) => {
  try {
    if (BotHelper.isYoutubeLink(url)) {
      if (url.includes('youtu.be')) {
        return url.split('youtu.be/')[1];
      } else {
        return url.split('v=')[1].split('&')[0];
      }
    } else {
      if (Ytdl.validateID(url)) {
        return url;
      } else {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
};

convertTime = (isoTime) => {
  const duration = moment.duration(isoTime);
  return moment.utc(duration.as('milliseconds')).format('HH:mm:ss');
};
