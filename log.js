"use strict";

const logger = require("log4js");
logger.configure("./log-config.json");

exports.systemLogger = logger.getLogger("system");
exports.loungeLogger = logger.getLogger("lounge");
exports.userLogger = logger.getLogger("user");
