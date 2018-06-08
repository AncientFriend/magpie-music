const fs = require('fs');
const config = require('../config.json')
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
  } else
      if (url.includes('youtube')) {
        return true;
      } else {
        return false;
      }
};

module.exports.search = function search (args) {
  console.log('search started');
  const proccesedResponse = []
  const url = 'https://www.googleapis.com/youtube/v3/search?key=' +
  config.Api_Key +
  '&maxResults=5' +
  '&part=snippet' +
  '&q=' + args.join(' ');
  console.log('URL - ',url);
  return request.get(url)
  .then((response) => {
    console.log('response', response);
    response.body.items.forEach((item) => {proccesedResponse.push(item.id.videoId) })
    return proccesedResponse
  }).catch((err) => {throw err})
}
