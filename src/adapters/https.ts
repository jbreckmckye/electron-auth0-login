import https, { RequestOptions } from 'https';
import { Adapter } from '../types';
import { adapter } from '../framework';

export const net: Adapter = (op, ctx, config) => {
    return adapter(op, 'net', {
        post: (input, opts) => {
            const content = JSON.stringify(input);

            const options: RequestOptions = {
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': content.length
                },
                ...opts
            };

            return new Promise((resolve, reject) => {
                const request = https.request(options, resp => {
                    resp.on('data', resolve);
                });

                request.on('error', reject);

                request.write(content);
                request.end();
            });
        }
    })
}
