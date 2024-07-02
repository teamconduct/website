import { sha512 } from 'js-sha512';
import { Buffer } from 'buffer';

export class Sha512 {

    public constructor(
        private readonly valueEncoding: BufferEncoding = 'utf8',
        private readonly hashEncoding: BufferEncoding = 'hex'
    ) {}

    public hashBytes(...values: Uint8Array[]): Uint8Array {
        const hash = sha512.create();
        hash.update(Buffer.concat(values));
        return Buffer.from(hash.arrayBuffer());
    }

    public hash(...values: string[]): string {
        const hashBytes = this.hashBytes(...values.map(value => Buffer.from(value, this.valueEncoding)));
        return Buffer.from(hashBytes).toString(this.hashEncoding);
    }
}
// Compare this snippet from src/app/utils/xor.ts:
