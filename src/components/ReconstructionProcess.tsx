'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function ReconstructionProcess() {
    const router = useRouter();
    const { account } = useWallet();

    const [isLoading, setIsLoading] = useState(true);
    const [pinataURI, setPinataURI] = useState('');

    const [name, setName] = useState('');

    useEffect(() => {
        new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
            setPinataURI('actual URI');
            setIsLoading(false);
        });
    }, []);

    return (
        <section className='process'>
            <Image id='gray-logo' src='/icons/logo.svg' alt='logo' width={43} height={39} />
            <h1>Reconstructing Digital Identity...</h1>
            <div className='address'>
                {useMemo(() => {
                    if (pinataURI && !isLoading)
                        return (
                            <input
                                type='text'
                                placeholder='Example: James Lim'
                                onChange={(event) => setName(event.target.value)}
                            />
                        );
                    if (pinataURI && isLoading)
                        return (
                            <>
                                <h4>{name}</h4>
                                <h6>{account?.address}</h6>
                            </>
                        );

                    return <h6>{account?.address}</h6>;
                }, [pinataURI, isLoading])}
            </div>
            <h6>
                {useMemo(() => {
                    if (pinataURI && !isLoading)
                        return `Your identity is reconstructed perfectly with our DeepFace AI Engine. If you wish to view the result with our embed 3D viewer, click here. 
				Provide a name for your digital human ID and proceed with generating your identity on Aptos once confirmed.`;
                    if (pinataURI && isLoading)
                        return `Digital Human ID minting is in progress, do complete all the wallet actions prompted by our application. 
				Please be patient and do not close the window or refresh this page as it might affect the progress of the minting.`;
                    return `Hey, you're almost there! Our DeepFace AI Engine is now reconstructing your digital identity with your face data.
				Please be patient and do not close the window or refresh this page as it might affect the progress of the reconstruction.`;
                }, [pinataURI, isLoading])}
            </h6>
            {useMemo(
                () =>
                    isLoading ? (
                        <div className='progress'></div>
                    ) : (
                        <button
                            id='green-button'
                            onClick={() => {
                                if (!name) return;
                                //todo send minting request
                                setIsLoading(true);
                                new Promise((resolve) => setTimeout(resolve, 3000)).then(() =>
                                    router.push('/digital-id')
                                );
                            }}
                        >
                            <Image src='/icons/aptos.svg' alt='aptos' width={20} height={20} />
                            Generate Identity
                        </button>
                    ),
                [isLoading, name]
            )}
        </section>
    );
}
