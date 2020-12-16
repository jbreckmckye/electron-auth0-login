import { Adapter } from '../types';

export const logger: Adapter<'logger'> = () => {
    return {
        warn: (...s: string[]) => console.warn(...s)
    }
}
