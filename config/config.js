'use strict';

var path = require('path'),
  fs = require('fs'),
  rootPath = path.normalize(__dirname + '/..'),
  env,
  db,
  port,
  b_port,
  p2p_port;

var packageStr = fs.readFileSync('package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || (getUserHome() + '/.insight-monacore');

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = process.env.INSIGHT_PORT || '3000';
  b_port = '9402';
  p2p_port = '9401';
}
else {
  env = 'testnet';
  db = home + '/testnet';
  port = process.env.INSIGHT_PORT || '3001';
  b_port = '19402';
  p2p_port = '19401';
}


switch (process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'testnet';

var dataDir = process.env.MONACOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\Monacoin\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/Monacoin/';
  if (isLinux) dataDir = process.env.HOME + '/.monacoin/';
}
dataDir += network === 'testnet' ? 'testnet3' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;


var bitcoindConf = {
  protocol: process.env.MONACOIND_PROTO || 'http',
  user:     process.env.MONACOIND_USER || 'user',
  pass:     process.env.MONACOIND_PASS || 'pass',
  host:     process.env.MONACOIND_HOST || '127.0.0.1',
  port:     process.env.MONACOIND_PORT || b_port,
  p2pPort:  process.env.MONACOIND_P2P_PORT || p2p_port,
  p2pHost:  process.env.MONACOIND_P2P_HOST || process.env.MONACOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

var enableMailbox = process.env.ENABLE_MAILBOX === 'true';
var enableRatelimiter = process.env.ENABLE_RATELIMITER === 'true';
var loggerLevel = process.env.LOGGER_LEVEL || 'info';
var enableHTTPS = process.env.ENABLE_HTTPS === 'true'; 

if (!fs.existsSync(db)) {
  var err = fs.mkdirSync(db);
  if (err) {
    console.log(err);
    console.log("## ERROR! Can't create insight directory! \n");
    console.log('\tPlease create it manually: ', db);
    process.exit(-1);
  }
}

module.exports = {
  enableMailbox: enableMailbox,
  enableRatelimiter: enableRatelimiter,
  loggerLevel: loggerLevel,
  enableHTTPS: enableHTTPS,
  version: version,
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: bitcoindConf,
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
