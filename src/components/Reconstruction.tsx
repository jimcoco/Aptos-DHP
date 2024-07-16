'use client';

import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import useImageProcessing from '@/hooks/useImageProcessing';

import { State } from 'types';

interface Props {
    createDigitalId: (address: string, name: string, faceDataLink: string) => Promise<void>;
    setFinished: Dispatch<SetStateAction<boolean>>;
    file: File;
}

export default function Reconstruction({ createDigitalId, setFinished, file }: Props) {
    const { account } = useWallet();
    const { startServer, stopServer, uploadImage, sendImage, serverStatus, objLink } =
        useImageProcessing();

    const [stage, setStage] = useState(1);
    const [name, setName] = useState('');

    const sendingDataRecursion = () => {
        uploadImage(file).then(async (success) => {
            if (!success) sendingDataRecursion();
            else {
                let tries = 0;
                let runs = 0;

                while (runs < 4 && tries < 10) {
                    const result = await sendImage(file);
                    result ? runs++ : tries++;
                }

                if (tries == 7) {
                    return;
                } else setStage(3);
            }
        });
    };

    const stopServerRecursion = async () => {
        const result = await stopServer();
        if (!result) stopServerRecursion();
    };

    useEffect(() => {
        if (stage == 0)
            new Promise((resolve) => setTimeout(resolve, 3_000)).then(() => setStage(1));
        if (stage == 1)
            serverStatus().then(async (status) => {
                if (status == State.Stopping) {
                    setStage(0);
                    return;
                }
                if (status == State.Stopped) {
                    const success = await startServer();
                    if (success) {
                        await new Promise((resolve) => setTimeout(resolve, 180_000));
                        setStage(2);
                    } else setStage(0);
                } else setStage(2);
            });

        if (stage == 2) sendingDataRecursion();
    }, [stage]);

    const handleGenerateClick = useMemo(
        () => async () => {
            if (!name) return;
            setStage(4);
            await createDigitalId(account?.address as string, name, objLink);
            await stopServerRecursion();
            setFinished(true);
        },
        [objLink, name, account]
    );

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
                            <button id='green-button' onClick={handleGenerateClick}>
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

interface StageProps {
    header: string;
    address?: string;
    description: string;
    time?: string;

    name?: string;
}

function Stage({ header, address, description, time, name }: StageProps) {
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
