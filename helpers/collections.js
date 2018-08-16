// commands aviable in the bot
module.exports.commands = [
  // OLD
  'play',
  'add',
  'queue\nq',
  'leave',
  'join',
  'pause',
  'continue\nresume',
  'debug',
  'clear\nempty\nclearall\nclearqueue\nemptyqueue',
  'list\nlistcommands\ncommands',
  'find\nsearch',
  'ping',
  'playlist',
  'WIP export\nWIP import',
  'shuffle',
  'skip'
];

module.exports.mapping = {
  q: 'queue',
  continue: 'resume',
  empty: 'clear',
  clearall: 'clear',
  clearqueue: 'clear',
  emptyqueue: 'clear',
  listcommands: 'list',
  commands: 'list',
  info: 'help',
  find: 'search',
  stop: 'pause'

};

module.exports.explanations = {
  play: {
    syntax: '!play <id> | <link> ',
    desc: 'checks arguments for youtube links and ids\nplays the given song\nif no argument given plays first out of queue or resumes paused song'
  },
  add: {
    syntax: '!add <id ...> | <link ...>',
    desc: 'checks arguments for youtube links and ids\nadds the given songs to the queue'
  },
  queue: {
    syntax: '!queue <number>',
    desc: 'displays the queue\nif argument given displays x titles of the q',
    alias: [
      'q'
    ]
  },
  leave: {
    syntax: '!leave',
    desc: 'tries to leave the callers voiceChannel'
  },
  join: {
    syntax: '!join',
    desc: 'tries to join the callers voiceChannel'
  },
  pause: {
    syntax: '!pause',
    desc: 'pauses song thats playing atm',
    alias: [
      'stop'
    ]
  },
  resume: {
    syntax: '!resume',
    desc: 'resumes song thats paused atm',
    alias: [
      'continue'
    ]
  },
  debug: {
    syntax: '!debug <rejoin> | -r',
    desc: 'clears everything and leaved channels in order to get the bot unstuck\nif rejoin or -r is given in the arguments it\'ll rejoin voice after getting unstuck'
  },
  clear: {
    syntax: '!clear',
    desc: 'clears queue',
    alias: [
      'clear',
      'empty',
      'clearall',
      'clearqueue',
      'emptyqueue'
    ]
  },
  list: {
    syntax: '!list',
    desc: 'lists all documented commands',
    alias: [
      'listcommands',
      'commands'
    ]
  },
  search: {
    syntax: '!search <argument ...> ',
    desc: 'searches for top 5 searchresults in youtube',
    alias: [
      'find'
    ]
  },
  ping: {
    syntax: '!ping',
    desc: 'returns latency of the server'
  },
  import: {
    syntax: '!import',
    desc: 'WIP'
  },
  export: {
    syntax: '!export',
    desc: 'WIP'
  },
  playlist: {
    syntax: '!playlist <link>',
    desc: 'puts every undeleted video into the queue'
  },
  help: {
    syntax: '!help <command>',
    desc: 'explains the use of given command',
    alias: [
      'info'
    ]
  },
  shuffle: {
    syntax: '!shuffle',
    desc: 'toggles shufflemode'
  },
  skip: {
    syntax: '!skip',
    desc: 'skipps the next song',
    alias: [
      'next'
    ]
  }
};
