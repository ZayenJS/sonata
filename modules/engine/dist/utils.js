"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegexChars = exports.regexIndexOf = exports.getRandomColor = exports.getRandomString = exports.getRandomInt = exports.unescape = exports.escape = void 0;
const escape = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
exports.escape = escape;
const unescape = (str) => String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
exports.unescape = unescape;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
exports.getRandomInt = getRandomInt;
const getRandomString = (length) => Math.random().toString(36).slice(2, length);
exports.getRandomString = getRandomString;
const getRandomColor = () => `#${(0, exports.getRandomString)(6)}`;
exports.getRandomColor = getRandomColor;
const regexIndexOf = (text, re, start) => {
    const indexInSuffix = text.slice(start).search(re);
    return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + start;
};
exports.regexIndexOf = regexIndexOf;
const escapeRegexChars = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
exports.escapeRegexChars = escapeRegexChars;
