import { Aptos, AptosConfig, InputViewFunctionData, Network, Signature } from '@aptos-labs/ts-sdk';
import { InputTransactionData, useWallet } from '@aptos-labs/wallet-adapter-react';

import signMessageToBytes from '@/utils/sign-message';

import { DigitalId } from '@/types';

const useDigitalId = () => {
    const { signAndSubmitTransaction, signMessage } = useWallet();

    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(aptosConfig);

    const moduleAddress = process.env.NEXT_PUBLIC_MODULE as string;

    const hasDigitalId = async (address: string): Promise<boolean> => {
        const payload: InputViewFunctionData = {
            function: `${moduleAddress}::digital_id::has_digital_id`,
            functionArguments: [address],
        };

        const response = await aptos.view({ payload });

        return response[0] as boolean;
    };

    const getDigitalId = async (address: string): Promise<DigitalId | undefined> => {
        const exists = await hasDigitalId(address);
        if (!exists) return;

        const resource = await aptos.getAccountResource({
            accountAddress: address,
            resourceType: `0x${process.env.NEXT_PUBLIC_MODULE}::digital_id::DigitalId`,
        });

        const token = await aptos.getAccountResource({
            accountAddress: resource.token_id,
            resourceType: '0x4::token::Token',
        });

        const response = await fetch(`/api/pinata?ipfsHash=${token.uri.split('/')[4]}`);
        const body = await response.json();

        const digitalId: DigitalId = {
            name: body.name,
            digitalIdAddress: resource.token_id,
            faceIpfsHash: body.objLink,
        };

        if (resource.iris.vec.length) digitalId.irisAddress = resource.iris.vec[0];
        if (resource.fingerprint.vec.length)
            digitalId.fingerprintAddress = resource.fingerprint.vec[0];

        return digitalId;
    };

    const createDigitalId = async (address: string, name: string, faceData: Buffer) => {
        const exists = await hasDigitalId(address);
        if (exists) return;

        const signedResponse = await signMessage({
            message: address + name + Date.now(),
            nonce: '127',
        });
        const signature = signedResponse.signature as Signature;

        const formData = new FormData();
        formData.append('faceData', new Blob([faceData]));
        formData.append('personName', name);
        formData.append('key', signature.toString());

        const response = await fetch('/api/pinata', {
            method: 'POST',
            body: formData,
        });
        if (response.status != 200) return;
        const body = await response.json();

        const tx: InputTransactionData = {
            data: {
                function: `${process.env.NEXT_PUBLIC_MODULE}::digital_id::create_digital_id`,
                functionArguments: [
                    `${process.env.PINATA_URL}${body.ipfsHash}`,
                    signMessageToBytes(`${process.env.PINATA_URL}${body.ipfsHash}`),
                ],
            },
        };
        await signAndSubmitTransaction(tx);
    };

    const verifyDigitalData = async (
        address: string,
        dataType: 'iris' | 'fingerprint',
        image: Buffer
    ) => {
        const exists = await hasDigitalId(address);
        if (!exists) return;

        const resource = await aptos.getAccountResource({
            accountAddress: address,
            resourceType: `0x${process.env.NEXT_PUBLIC_MODULE}::digital_id::DigitalId`,
        });

        if (resource[dataType].length) return;

        const token = await aptos.getAccountResource({
            accountAddress: resource.token_id,
            resourceType: '0x4::token::Token',
        });

        const response = await fetch('/api/pinata', {
            method: 'PUT',
            body: JSON.stringify({
                dataType,
                image,
                digitalIdHash: token.uri.split('/')[4],
            }),
        });
        if (response.status != 200) return;
        const body = await response.json();

        const tx: InputTransactionData = {
            data: {
                function: `${process.env.NEXT_PUBLIC_MODULE}::digital_id::verify_data`,
                functionArguments: [
                    `${process.env.PINATA_URL}${body.digitaIdIpfsHash}`,
                    dataType,
                    `${process.env.PINATA_URL}${body.dataIpfsHash}`,
                    signMessageToBytes(`${process.env.PINATA_URL}${body.digitaIdIpfsHash}`),
                ],
            },
        };
        await signAndSubmitTransaction(tx);
    };

    const getParticipants = async (): Promise<number> => {
        const response = await aptos.view({
            payload: { function: `${moduleAddress}::digital_id::get_total_people` },
        });

        return response[0] ? Number(response[0]) : 0;
    };

    return { hasDigitalId, createDigitalId, verifyDigitalData, getParticipants, getDigitalId };
};

export default useDigitalId;
