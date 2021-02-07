import crypto from 'crypto';
import { Adapter, PKCEPair } from '../types';
import { context } from '../framework';

export const cryptography: Adapter = () => context('cryptography', {
    /**
     * PKCE requires a cryptographic pair of a random b64 string encoded, then the encoded hash of the first string
     */
    getPKCEChallengePair: (): PKCEPair => {
        const seed = base64random(32);
        const verifier = urlEncodeBase64String(seed);
        const challenge = urlEncodeBase64String(base64hash(verifier));
        return { verifier, challenge };
    }
})

function urlEncodeBase64String(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64hash(str: string) {
    return crypto.createHash('sha256').update(str).digest().toString('base64');
}

function base64random(bytes: number) {
    return crypto.randomBytes(bytes).toString('base64');
}
