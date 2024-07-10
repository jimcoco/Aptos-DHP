'use state';

import Image from 'next/image';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import MintingProcess from './MintingProcess';

import './verification-popup.css';
import ReconstructionProcess from './ReconstructionProcess';

interface Props {
    dataType: string;
    mintingFunction: () => Promise<void>;
    setVerification: (value: React.SetStateAction<boolean>) => void;
}

export default function ProcessingPopup({ dataType, mintingFunction, setVerification }: Props) {
    const router = useRouter();

    const [isMinting, setIsMinting] = useState(false);

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
                    onClick={() => setVerification(false)}
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
                        setIsMinting(true);

                        if (!isFace) {
                            await mintingFunction();
                            //todo wait for the transcation to pass
                            await new Promise((resolve) => setTimeout(resolve, 3000));
                            router.push('/digital-id');
                        }

                        //todo then procces all the data in the reconstruction process
                    }}
                >
                    Confirm and start {isFace ? 'reconstruction' : 'verification'}
                </button>
            </section>
            {useMemo(() => {
                if (isMinting && isFace) return <ReconstructionProcess />;
                if (isMinting && !isFace) return <MintingProcess dataType={dataType} />;
                return <></>;
            }, [isMinting])}
        </>
    );
}
