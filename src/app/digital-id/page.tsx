'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import useDigitalId from '@/hooks/useDigitalId';

import BiometricsStatus from './BiometricsStatus';
import Nav from '@/components/Nav';

import { DigitalId } from '@/types';

import './digital-id.css';

export default function DigitalHuman() {
    const router = useRouter();
    const { account, connected } = useWallet();
    const { getDigitalId } = useDigitalId();

    const [digitalId, setDigitalId] = useState<DigitalId>();

    useEffect(() => {
        console.log(digitalId?.faceLink);
    }, [digitalId]);

    useEffect(() => {
        if (!connected) router.push('/');
        if (connected && account)
            getDigitalId(account.address as string).then((data) => setDigitalId(data));
    }, [connected, account]);

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
                <h1>{digitalId ? digitalId.name : 'Fetching...'}</h1>
                <h6 className='address'>
                    {account
                        ? account.address.slice(0, 5) + '...' + account.address.slice(59, 64)
                        : '0x0'}
                </h6>
                <div className='human-data'>
                    <div>
                        <Image src='/icons/aptos.svg' alt='passport' width={20} height={20} />
                        <Link
                            href={`https://explorer.aptoslabs.com/object/${digitalId?.digitalIdAddress}?network=testnet`}
                        >
                            View Digital Human ID
                        </Link>
                    </div>
                    {useMemo(
                        () => (
                            <Link href={digitalId?.faceLink ? digitalId.faceLink : '/digital-id'}>
                                <Image
                                    src='/icons/face-preview.png'
                                    alt='face-preview'
                                    width={20}
                                    height={20}
                                />
                            </Link>
                        ),
                        [digitalId]
                    )}
                </div>
                <h6>Biometrics</h6>
                <div className='biometrics'>
                    {useMemo(
                        () => (
                            <>
                                <BiometricsStatus
                                    name='Iris'
                                    objectAddress={digitalId?.irisAddress}
                                />
                                <BiometricsStatus
                                    name='Fingerprint'
                                    objectAddress={digitalId?.fingerprintAddress}
                                />
                            </>
                        ),
                        [digitalId]
                    )}
                </div>
                <Link href={'/'} className='home-button'>
                    <Image src='/icons/home-button.svg' alt='home' width={72} height={72} />
                </Link>
            </section>
        </main>
    );
}
