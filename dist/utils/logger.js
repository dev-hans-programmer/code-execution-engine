"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config/config");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }),
];
if (config_1.config.logging.enableFileLogging) {
    transports.push(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
    }), new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    format: logFormat,
    transports,
});
if (config_1.config.logging.enableFileLogging) {
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }
}
//# sourceMappingURL=logger.js.map