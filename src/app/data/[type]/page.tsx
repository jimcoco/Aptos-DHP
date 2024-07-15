'use client';

import Image from 'next/image';
import Link from 'next/link';

import ConfirmingPopup from '@/components/ConfirmingPopup';
import Nav from '@/components/Nav';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import pageData from './pageData';

import './data.css';

export default function DataCollection() {
    const router = useRouter();
    const dataType = usePathname().split('/')[2];
    const data = pageData[dataType];

    const { connected } = useWallet();

    const [file, setFile] = useState<File | undefined>(undefined);

    const [confirming, setConfirming] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (!connected || finished) router.push('/');
    }, [connected, finished]);

    return (
        <main className='data'>
            <Nav />
            <h2>{data.name}</h2>
            <h6>{data.description}</h6>
            <section className='scan-methods'>
                <Image
                    className='device'
                    src={data.device.image}
                    alt='scanner-device'
                    height={277}
                    width={410}
                />
                <Image
                    className='upload'
                    src={data.upload.image}
                    alt='image-uploading'
                    height={228}
                    width={228}
                />
                <h3>{data.device.name}</h3>
                <h3>{data.upload.name}</h3>
                <h6>{data.device.by}</h6>
                <h6>{data.upload.by}</h6>
                <button id='disabled' disabled>
                    Connect to scanner
                </button>
                {useMemo(
                    () =>
                        file ? (
                            <button id='gray-button'>
                                {file ? file.name : ''} <input type='file' />
                                <Image
                                    src='/icons/cross.svg'
                                    alt='cross'
                                    height={20}
                                    width={20}
                                    onClick={() => setFile(undefined)}
                                />
                            </button>
                        ) : (
                            <button id='green-button'>
                                {data.upload.buttonText}
                                <input
                                    type='file'
                                    onChange={(event) => setFile(event.target.files?.[0])}
                                />
                            </button>
                        ),
                    [file]
                )}

                <Link href={''}>Available Soon</Link>
                {useMemo(
                    () => (
                        <Image
                            id='next-button'
                            src='/icons/next-button.svg'
                            alt='next'
                            height={72}
                            width={72}
                            onClick={() => (file ? setConfirming(true) : {})}
                            style={file ? {} : { pointerEvents: 'none', opacity: '30%' }}
                        />
                    ),
                    [file]
                )}
                <div className='filler'></div>
            </section>
            {useMemo(
                () =>
                    confirming ? (
                        <ConfirmingPopup
                            dataType={dataType}
                            setConfirming={setConfirming}
                            setFinished={setFinished}
                            file={file}
                        />
                    ) : (
                        <></>
                    ),
                [confirming]
            )}
        </main>
    );
}
