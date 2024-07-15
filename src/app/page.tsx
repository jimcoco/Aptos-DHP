'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import useDigitalId from '@/hooks/useDigitalId';

const World = dynamic(() => import('@/components/ui/globe').then((m) => m.World), {
    ssr: false,
});
import { arcs, globeConfig } from '@/data/globe-data';

import './home.css';

export default function Home() {
    const { getParticipants } = useDigitalId();

    const [participants, setParticipants] = useState(0);

    useEffect(() => {
        getParticipants().then((data) => setParticipants(data));
    }, []);

    return (
        <main className='home'>
            <Image id='gray-logo' src='/icons/logo.svg' alt='logo' width={43} height={39} />
            <h1>Digital Human Project</h1>
            <h5>The Only Proof of Personhood on Aptos.</h5>
            <div className='buttons'>
                <Link id='green-button' href='/connect'>
                    <Image src='/icons/aptos.svg' alt='aptos' width={20} height={20} />
                    Generate Identity
                </Link>
                <Link id='gray-button' href='/connect'>
                    Connect Identity
                </Link>
            </div>
            <div className='participants'>{participants} unique humans participated</div>
            <World globeConfig={globeConfig} data={arcs} />
        </main>
    );
}
