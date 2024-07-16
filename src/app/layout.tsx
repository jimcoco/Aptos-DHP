import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';

import AptosProvider from '@/context/AptosProvider';

import './globals.css';
import '@/styles/buttons.css';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
    title: 'Digital Human',
    description: 'Digital Human on Aptos',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={manrope.className}>
                <AptosProvider>{children}</AptosProvider>
            </body>
        </html>
    );
}
