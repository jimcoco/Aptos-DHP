import CryptoJs from 'crypto-js';

export function encrypt(data: string, key: string): string {
    const result = CryptoJs.AES.encrypt(data, key);
    return result.toString();
}

export function decrypt(data: string, key: string) {
    const result = CryptoJs.AES.decrypt(data, key);
    return result.toString(CryptoJs.enc.Utf8);
}
