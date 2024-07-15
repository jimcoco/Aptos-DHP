'use state';

import Image from 'next/image';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import Verification from './Verification';
import Reconstruction from './Reconstruction';

import useDigitalId from '@/hooks/useDigitalId';

import './verification-popup.css';

interface Props {
    dataType: string;
    file: File | undefined;

    setConfirming: Dispatch<SetStateAction<boolean>>;
    setFinished: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmingPopup({ dataType, file, setConfirming, setFinished }: Props) {
    const { account } = useWallet();
    const { createDigitalId, verifyDigitalData } = useDigitalId();

    const [executing, setExecuting] = useState(false);

    const isFace = dataType == 'face';

    return (
        <>
            <section className='verification'>
                <Image
                    id='next-button'
                    src='/icons/prev-button.svg'
                    alt='next'
                    height={72}
                    width={72}
                    onClick={() => setConfirming(false)}
                />
                <h1>
                    {isFace
                        ? 'Face Data Reconstruction'
                        : `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}  Verification`}
                </h1>
                <h6>
                    {isFace
                        ? `Thanks for providing your selfie image! Your selfie image will be processed by our deep learning face engine to reconstruct a detail face model which will be used to generate a digital human ID on Aptos.`
                        : `Thanks for providing your ${dataType} data! The ${dataType} data collected in the previous step
                will be minted into a verification token on Aptos and will be encrypted with Aptos
                primitive cryptography system to ensure maximum confidential.`}
                </h6>
                <button
                    id='green-button'
                    onClick={async () => {
                        if (!account || !file) return;
                        setExecuting(true);

                        if (!isFace) {
                            await verifyDigitalData(
                                account.address,
                                dataType == 'iris' ? 'iris' : 'fingerprint',
                                Buffer.from(await file.arrayBuffer())
                            ).catch((error) => {
                                alert('An error occured ' + error);
                            });
                            setFinished(true);
                        }
                    }}
                >
                    Confirm and start {isFace ? 'reconstruction' : 'verification'}
                </button>
            </section>
            {useMemo(
                () =>
                    executing ? (
                        isFace && file ? (
                            <Reconstruction
                                createDigitalId={createDigitalId}
                                setFinished={setFinished}
                                file={file}
                            />
                        ) : (
                            <Verification dataType={dataType} address={account?.address} />
                        )
                    ) : (
                        <></>
                    ),
                [executing, file]
            )}
        </>
    );
}
