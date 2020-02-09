import crypto from 'crypto';

export interface PKCEPair {
    verifier: string,
    challenge: string
}

export function getPKCEChallengePair(): PKCEPair {
    const seed = base64random(32);
    const verifier = urlEncodeBase64String(seed);
    const challenge = urlEncodeBase64String(base64hash(verifier));
    return {verifier, challenge};
}

function urlEncodeBase64String(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64hash(str: string) {
    return crypto.createHash('sha256').update(str).digest().toString('base64');
}

function base64random(bytes: number) {
    return crypto.randomBytes(bytes).toString('base64');
}