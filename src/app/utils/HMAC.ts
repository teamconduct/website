import { Sha512 } from './sha512';
import { Buffer } from 'buffer';

export class HMAC {

    public constructor(
        private readonly key: string
    ) {}

    private xor(lhs: Uint8Array, rhs: Uint8Array): Uint8Array {
        if (lhs.length !== rhs.length)
            throw new Error('Xor operands must be the same length.');
        return lhs.map((lhsElement, index) => lhsElement ^ rhs[index]);
    }


    public sign(message: string): string {
        const keyBytes = Buffer.from(this.key, 'hex');
        const hashedKey = new Sha512().hashBytes(keyBytes);
        const opad = new Uint8Array(hashedKey.length).fill(0x5C);
        const ipad = new Uint8Array(hashedKey.length).fill(0x36);
        const value1 = this.xor(hashedKey, opad);
        const value2 = new Sha512().hashBytes(this.xor(hashedKey, ipad));
        const value3 = Buffer.from(message, 'utf8');
        const tagBytes = new Sha512().hashBytes(new Uint8Array([...value1, ...value2, ...value3]));
        return Buffer.from(tagBytes).toString('hex');
    }

    public verify(message: string, tag: string): boolean {
        const expectedTag = this.sign(message);
        if (tag.length !== expectedTag.length)
            return false;
        for (let i = 0; i < tag.length; i++) {
            if (tag[i] !== expectedTag[i])
                return false;
        }
        return true;
    }
}
