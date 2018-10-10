import crypto from 'crypto';

export function urlEncodeBase64String(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64hash(str: string) {
    return crypto.createHash('sha256').update(str).digest().toString('base64');
}

export function base64random(bytes: number) {
    return crypto.randomBytes(bytes).toString('base64');
}