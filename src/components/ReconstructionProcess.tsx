'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function ReconstructionProcess() {
    const router = useRouter();
    const { account } = useWallet();

    const [stage, setStage] = useState(1);
    //1 - warming the server
    //2 - reconstructiong the identity
    //3 - input
    //other - minting, last stage

    const [name, setName] = useState('');

    useEffect(() => {
        new Promise((resolve) => setTimeout(resolve, 5000)).then(async () => {
            setStage(2);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            setStage(3);
        });
    }, []);

    return (
        <>
            {useMemo(
                () =>
                    stage == 1 ? (
                        <Stage
                            header='Fetching dedicated computing resources...'
                            address={account?.address}
                            description='Please be patient while our application is assigning dedicated computing resource for your wallet address to process your face data using our DeepFace AI Engine. Do not close the window or refresh this page as it might affect the process.'
                            time='Estimated waiting time: 3 minutes'
                        />
                    ) : stage == 2 ? (
                        <Stage
                            header='Reconstructing Digital Identity...'
                            address={account?.address}
                            description="Hey, you're almost there! Our DeepFace AI Engine is now reconstructing your digital identity with your face data. Please be patient and do not close the window or refresh this page as it might affect the progress of the reconstruction."
                            time='Estimated waiting time: 1 minute'
                        />
                    ) : stage == 3 ? (
                        <section className='process'>
                            <Image
                                id='gray-logo'
                                src='/icons/logo.svg'
                                alt='logo'
                                width={43}
                                height={39}
                            />
                            <h1>Provide a name for your Digital Human ID.</h1>
                            <div className='address'>
                                <input
                                    type='text'
                                    placeholder='Example: James Lim'
                                    onChange={(event) => setName(event.target.value)}
                                />
                            </div>
                            <h6>
                                Your identity is reconstructed perfectly with our DeepFace AI
                                Engine. If you wish to view the result with our embed 3D viewer,
                                click here. Provide a name for your digital human ID and proceed
                                with generating your identity on Aptos once confirmed.
                            </h6>
                            <button
                                id='green-button'
                                onClick={() => {
                                    if (!name) return;
                                    setStage(4);
                                    //todo await for minting request
                                    new Promise((resolve) => setTimeout(resolve, 3000)).then(() =>
                                        router.push('/digital-id')
                                    );
                                }}
                            >
                                <Image src='/icons/aptos.svg' alt='aptos' width={20} height={20} />
                                Generate Identity
                            </button>
                        </section>
                    ) : (
                        <Stage
                            header='Generating Digital Human ID...'
                            name={name}
                            address={account?.address}
                            description='Digital Human ID minting is in progress, do complete all the wallet actions prompted by our application. Please be patient and do not close the window or refresh this page as it might affect the progress of the minting.'
                        />
                    ),
                [stage, name]
            )}
        </>
    );
}

interface Props {
    header: string;
    address?: string;
    description: string;
    time?: string;

    name?: string;
}

function Stage({ header, address, description, time, name }: Props) {
    return (
        <section className='process'>
            <Image id='gray-logo' src='/icons/logo.svg' alt='logo' width={43} height={39} />
            <h1>{header}</h1>
            <div className='address'>
                {name ? (
                    <>
                        <h4>{name}</h4>
                        <h6>{address}</h6>
                    </>
                ) : (
                    <h6>{address}</h6>
                )}
            </div>
            <h6>{description}</h6>
            <>
                <div className='progress'></div>
                {time ? <h6>{time}</h6> : <></>}
            </>
        </section>
    );
}
