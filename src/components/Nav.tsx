'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWalletName } from 'petra-plugin-wallet-adapter';

export default function DataLayout() {
    const router = useRouter();
    const { account, connect, disconnect } = useWallet();

    useEffect(() => {
        if (account?.address) connect(PetraWalletName);
    }, [account]);

    return (
        <nav style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <Image
                id='gray-logo'
                src='/icons/logo.svg'
                alt='logo'
                width={43}
                height={39}
                onClick={() => router.push('/')}
                style={{ cursor: 'pointer' }}
            />
            <Link href='/' id='gray-button' onClick={disconnect}>
                Disconnect Wallet
            </Link>
        </nav>
    );
}
