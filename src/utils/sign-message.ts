import { Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

export default function signMessage(message: string): Uint8Array {
    const privateKey = new Ed25519PrivateKey(
        '0x21814ca126998fe612fb1dacfd0bfb6bcabe82c48a3fe56907ed8d14ebfb070a'
    );
    const signature = privateKey.sign(message);

    return signature.toUint8Array();
}
