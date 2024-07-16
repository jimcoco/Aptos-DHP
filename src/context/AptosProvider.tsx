'use client';

import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

export default function AptosProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const wallets = [new PetraWallet()];

    return (
        <AptosWalletAdapterProvider plugins={wallets} autoConnect>
            {children}
        </AptosWalletAdapterProvider>
    );
}
