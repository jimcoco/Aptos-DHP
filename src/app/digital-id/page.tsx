'use client';

import Link from 'next/link';
import Image from 'next/image';

import BiometricsMethod from './BiometricsMethod';
import Nav from '../../components/Nav';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import './digital-id.css';

export default function DigitalHuman() {
    const { account } = useWallet();

    return (
        <main className='digital-id'>
            <Nav />
            <section>
                <Image
                    className='passport'
                    src='/images/passport-active.png'
                    alt='passport'
                    width={360}
                    height={474}
                />
                <h1>My Name</h1>
                <h6 className='address'>
                    {account
                        ? account.address.slice(0, 5) + '...' + account.address.slice(59, 64)
                        : '0x0'}
                </h6>
                <div className='human-data'>
                    <div>
                        <Image src='/icons/aptos.svg' alt='passport' width={20} height={20} />
                        <Link href={'/'}>View Digital Human ID</Link>
                    </div>
                    <Image
                        src='/icons/face-preview.png'
                        alt='face-preview'
                        width={20}
                        height={20}
                    />
                </div>
                <h6>Biometrics</h6>
                <div className='biometrics'>
                    <BiometricsMethod name='Iris' image='iris.svg' href='/data/iris' />
                    <BiometricsMethod
                        name='Fingerprint'
                        image='fingerprint.svg'
                        href='/data/fingerprint'
                    />
                </div>
                <Link href={'/'} className='home-button'>
                    <Image src='/icons/home-button.svg' alt='home' width={72} height={72} />
                </Link>
            </section>
        </main>
    );
}
