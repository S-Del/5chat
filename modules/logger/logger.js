'use strict';

const log4js = require('log4js');
log4js.configure('./modules/logger/log-config.json');

exports.systemLogger = log4js.getLogger();
exports.loungeLogger = log4js.getLogger('lounge');
exports.roomLogger = log4js.getLogger('room');
exports.userLogger = log4js.getLogger('user');