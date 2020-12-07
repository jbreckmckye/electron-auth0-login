"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function getPKCEChallengePair() {
    const seed = base64random(32);
    const verifier = urlEncodeBase64String(seed);
    const challenge = urlEncodeBase64String(base64hash(verifier));
    return { verifier, challenge };
}
exports.getPKCEChallengePair = getPKCEChallengePair;
function urlEncodeBase64String(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function base64hash(str) {
    return crypto_1.default.createHash('sha256').update(str).digest().toString('base64');
}
function base64random(bytes) {
    return crypto_1.default.randomBytes(bytes).toString('base64');
}
