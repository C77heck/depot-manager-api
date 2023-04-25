import Redis from "ioredis";

import { CONSTANTS } from './constants';

const { REDIS } = CONSTANTS;

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: '',
} as any);

const get = async (key: string): Promise<any> => {
    try {
        const val = await redis.get(key);
        return JSON.parse(val || '');
    } catch (e) {
        console.log(e);
        return false;
    }
};

const set = async (key: string, value: string) => {
    try {
        await redis.set(key, value);
    } catch (e) {
        console.log(e);
    }
};

const clear = async (key: string) => {
    try {
        await redis.set(key, null as any);
    } catch (e) {
        console.log(e);
    }
};

const clearAll = async () => {
    try {
        for (const key in REDIS) {
            await clear(REDIS[key]);
        }
    } catch (e) {
        console.log(e);
    }
};

exports.get = get;
exports.set = set;
exports.clear = clear;
exports.clearAll = clearAll;
