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
const strings = require('./strings.json');

const dispatcher = Dispatcher.getInstance();
const queue = Queue.getInstance();
const cache = Cache.getInstance();
let openConnection;
let lastMessage;

let Client;

module.exports.setClient = (client) => {
  Client = client;
};

module.exports.play = async (args, message) => {
  console.warn('Play');
  try {
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
      playSong(args[0], openConnection, message);
    } else if (!queue.isEmpty()) {
      const item = queue.getNextTitle();
      message.channel.send('now playing: ```' + item.title + '```');
      playSong(item.id, openConnection, message);
    } else {
      message.channel.send('queue is empty and no arguments given');
    }
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.add = (args, message, delets) => {
  try {
    args.forEach((argument, index) => {
      const id = argument.includes('you') ? getId(argument) : argument;
      if (id) {
        getInfo(id, message)
        .then((obj) => {
          if (obj) {
            if (!queue.addToQueue(obj)) {
              message.channel.send('max length');
              throw new Error();
            }
          }
        });
      } else {
        const post = (index === 0) ? 'st' : 'ed';
        message.channel.send('for the ' + (index + 1) + post + ' argument no source could be found');
      }
    });
    console.warn(delets);
    if (delets > 0) message.channel.send(delets + ' where removed.');
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.playlist = async (args, message) => {
  try {
    const ytUrl = args[0];
    if (ytUrl.includes('youtube') && ytUrl.includes('playlist')) {
      let mapping = {'{PLAYLIST_ID}': ytUrl.split('list=')[1].split('&')[0], '{API_KEY}': process.env.API_KEY, '{TOKEN}': ''};
      const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId={PLAYLIST_ID}&key={API_KEY}&pageToken={TOKEN}';
      const response = (await request.get(url.replace(new RegExp('{PLAYLIST_ID}|{API_KEY}|{TOKEN}', 'gi'), function (matched) { return mapping[matched]; }))).body;
      let nextPageToken = response.nextPageToken || false;
      const ids = [];
      let delets = 0;
      response.items.forEach(item => {
        ids.push(item.snippet.resourceId.videoId);
        if (item.snippet.title === 'Deleted video') delets++;
      });
      this.add(ids, message, delets);
      while (nextPageToken) {
        mapping['{TOKEN}'] = nextPageToken;
        nextPageToken = false;
        const newUrl = url.replace(new RegExp('{PLAYLIST_ID}|{API_KEY}|{TOKEN}', 'gi'), function (matched) { return mapping[matched]; });
        let additionalPages = (await request.get(newUrl)).body;
        nextPageToken = additionalPages.nextPageToken || false;
        const ids = [];
        let delets = 0;
        additionalPages.items.forEach(item => {
          ids.push(item.snippet.resourceId.videoId);
          if (item.snippet.title === 'Deleted video') delets++;
        });
        this.add(ids, message, delets);
      }
    }
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
      response = moment.duration(playTime).humanize() + '\n' + response + (queueArr.length > 10 ? '\nand ' + (queueArr.length - 10) + ' more' : '');
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
    message.channel.send('dissabled because of a breaking bug. If the bot has to leave the channel you can use debug (empties queue)');
    // console.warn(client.user.presence);
    // const voiceChannel = message.member.voiceChannel;
    // if (voiceChannel) {
    //   try {
    //     dispatcher.setDispatcher();
    //     voiceChannel.leave();
    //   } catch (e) {
    //     console.log('ERROR - e', e);
    //   }
    // }
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

module.exports.skip = async (message, args) => {
  try {
    dispatcher.end('end');
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.list = async (args, message) => {
  try {
    message.channel.send('```' + Collections.commands.join('\n') + '```');
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

module.exports.volume = async (message, args) => {
  try {
    let disp = dispatcher.getDispatcher();
    if (disp) {
      if (!args[0]) {
        message.channel.send('Volume at: ' + disp.volume * 5);
      } else {
        disp.setVolume(args[0] / 5);
        message.channel.send('Volume now at : ' + disp.volume * 5);
      }
      dispatcher.setDispatcher(disp);
    } else {
      message.channel.send('nothing playing');
    }
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.export = async (args, message) => {
  try {
    message.channel.send('functionallity is beeing worked on right now');

    // console.warn('Arguments: ', args[0], ' - - ', args);
    // if (!args[0]) {
    //   message.channel.send('please choose a <name> for the playlist ```!export <name>```');
    //   return;
    // }
    // const q = JSON.stringify(queue.getQueue());
    // // const name = args[0].replace("'", "''")
    // console.warn('QUEUE', typeof q);
    // const query = `INSERT INTO Playlists (name, content) VALUES ('` + 'args[0]' + `', '` + 'justanotherqueue' + `');`;
    // console.warn('Q:', query);
    // await pgClient.connect();
    // const response = await pgClient.query(query);
    // await pgClient.end();

    // const q = queue.getQueue();
    // let exportList = [];
    // q.forEach((item) => {
    //   exportList.push(item.id);
    // });
    // const code = base64.encode(JSON.stringify(exportList));
    // code.match(/.{1,1500}/g).forEach(text => {
    //   pgClient.connect().then(res => {
    //     console.log(res);
    //     const query = pgClient.query("INSERT INTO playlists (name, content, duration) VALUES ('test', '" + text + "', '5')");
    //     query.on('end', res => {
    //       console.log(res);
    //     });
    //   });
    // });
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

module.exports.shuffle = async (message, args) => {
  try {
    const shuffle = queue.shuffle();
    console.warn(shuffle ? 'shuffle on' : 'shuffle off');
    message.channel.send(shuffle ? 'shuffle on' : 'shuffle off');
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

module.exports.help = (args, message) => {
  try {
    let command = args[0];
    if (Object.keys(Collections.mapping).includes(args[0])) {
      command = Collections.mapping[args[0]];
    }
    if (Object.keys(Collections.explanations).includes(command)) {
      message.channel.send(
        'syntax:' + '```' + Collections.explanations[command].syntax + '```' +
        'description:' + '```' + Collections.explanations[command].desc + '```' +
        (Collections.explanations[command].alias ?
        'alias' + '```' + Collections.explanations[command].alias + '```' :
        ''));
    }
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

playSong = (song, connection, message) => {
  lastMessage = message;
  try {
    message = message;
    const id = getId(song);
    if (id) {
      openConnection.playStream(Ytdl(id, {filter: 'audioonly'}));
      dispatcher.setDispatcher(openConnection.playStream(Ytdl(id, {filter: 'audioonly'})));
    } else {
      console.log('please use youtubelinks or id\'s');
    }
    dispatcher.on('end', end => {
      if (!queue.isEmpty()) {
        const item = queue.getNextTitle();
        const message = 'now playing: ```' + item.title + '```';
        lastMessage.channel.send(message);
        playSong(item.id, openConnection, lastMessage);
      } else {
        openConnection.channel.leave();
      }
    });
  } catch (e) {
    console.log('ERROR - catch', arguments.callee.name, e);
  }
};

getInfo = async (data, message) => {
  // TODO
  try {
    let url;
    url = 'https://www.googleapis.com/youtube/v3/videos?id=' + data + '&part=contentDetails,snippet&key=' + process.env.API_KEY;
    const response = await request.get(url);
    const deleted = isDeleted(response);
    if (!deleted) {
      const isoTime = response.body.items[0].contentDetails.duration;
      let duration = convertTime(isoTime);
      let title = response.body.items[0].snippet.title;
      let requester = message.member.user.username;
      return createQueueObject(title, duration, requester, data, isoTime);
    }
    return false;
  } catch (e) {
    console.log('ERROR', e);
    return false;
  }
};

isDeleted = (obj) => {
  try {
    return !obj.body.items[0].contentDetails;
  } catch (e) {
    return true;
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
