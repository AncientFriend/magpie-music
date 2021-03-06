const fs = require('fs');
const config = require('../config.json');
const request = require('snekfetch');

module.exports.getFileEnding = function getFileEnding (filename) {
  const help = filename.split('.');
  if (help.length === 1 || (help[0] === '' && help.length === 2)) {
    return '';
  }
  return help.pop();
};

module.exports.isUrl = function isUrl (url) {
  var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res == null) {
    return false;
  } else {
    return true;
  }
};

module.exports.isYoutubeLink = function isYoutubeLink (url) {
  var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res == null) {
    return false;
  } else {
    if (url.includes('youtube') || url.includes('youtu.be')) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports.search = async function search (args) {
  try {
    console.log('search started');
    const proccesedResponse = [];
    const url = 'https://www.googleapis.com/youtube/v3/search?key=' +
      process.env.API_KEY +
      '&maxResults=5' +
      '&part=snippet' +
      '&type=video' +
      '&q=' + args.join(' ');
    let response = await request.get(url);
    response.body.items.forEach((item, index) => {
      proccesedResponse.push(
        {
          id: item.id.videoId,
          index,
          title: item.snippet.title
        });
    });
    output = [];
    proccesedResponse.forEach((item, index) => {
      output.push(
        (item.index + 1) + '  -  ' + item.title + '\n'
      );
    });
    const ResponseObject = {
      output: output,
      cache: proccesedResponse
    };
    return ResponseObject;
  } catch (e) {
    console.warn(e);
  }
};
