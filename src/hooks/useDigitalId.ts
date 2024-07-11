import { Aptos, AptosConfig, InputViewFunctionData, Network } from '@aptos-labs/ts-sdk';
import { InputTransactionData, useWallet } from '@aptos-labs/wallet-adapter-react';

const useDigitalId = () => {
    const { signAndSubmitTransaction } = useWallet();

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
            faceIpfsHash: token.uri.split('/')[4],
        };

        if (resource.iris.length) digitalId.irisAddress = resource.iris[0];
        if (resource.fingerprint.length) digitalId.fingerprintAddress = resource.fingerprint[0];

        return digitalId;
    };

    const mintDigitalId = async (address: string, name: string) => {
        const exists = await hasDigitalId(address);
        if (exists) return;
        //todo get not encoded faceData

        const response = await fetch('/api/pinata', {
            method: 'POST',
            body: JSON.stringify({
                personName: name,
                faceData: 'proceeded face data',
            }),
        });
        const body = await response.json();

        const tx: InputTransactionData = {
            data: {
                function: `${process.env.NEXT_PUBLIC_MODULE}::digital_id::create_digital_id`,
                functionArguments: [`${process.env.PINATA_URL}${body.ipfsHash}`],
            },
        };
        await signAndSubmitTransaction(tx);
    };

    const verifyDigitalData = async (address: string, dataType: 'iris' | 'fingerprint') => {
        const exists = await hasDigitalId(address);
        if (!exists) return;

        //todo get not encoded data image

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
                image: 'some image of iris or fingerprint',
                digitalIdHash: token.uri.split('/')[4],
            }),
        });
        const body = await response.json();

        const tx: InputTransactionData = {
            data: {
                function: `${process.env.NEXT_PUBLIC_MODULE}::digital_id::verify_data`,
                functionArguments: [body.digitaIdIpfsHash, dataType, body.dataIpfsHash],
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

    return { hasDigitalId, mintDigitalId, verifyDigitalData, getParticipants, getDigitalId };
};

export default useDigitalId;
