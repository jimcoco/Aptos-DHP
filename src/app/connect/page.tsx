'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWalletName } from 'petra-plugin-wallet-adapter';

import './connect.css';

export default function ConnectWallet() {
    const { connect } = useWallet();

    return (
        <main className='connect'>
            <Image src='/icons/logo.svg' alt='logo' width={43} height={39} />
            <section className='wallet-connection'>
                <Link href='/'>Back to home</Link>
                <Image src='/images/passport.png' alt='passport' width={312} height={411} />
                <h4>Hey, you are almost there!</h4>
                <h1>Connect yourself to the Aptos Network.</h1>
                <button id='green-button' onClick={() => connect(PetraWalletName)}>
                    <Image src='/icons/petra-wallet.svg' alt='aptos' width={20} height={20} />
                    Connect Petra
                </button>
            </section>
        </main>
    );
}
