import { Aptos, AptosConfig, InputViewFunctionData, Network } from '@aptos-labs/ts-sdk';

const useDigitalId = () => {
    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(aptosConfig);

    const moduleAddress = process.env.NEXT_PUBLIC_MODULE as string;

    const hasDigitalId = async (address: string): Promise<boolean> => {
        console.log(address);
        const payload: InputViewFunctionData = {
            function: `${moduleAddress}::digital_id::has_digital_id`,
            functionArguments: [address],
        };

        const response = await aptos.view({ payload });

        return response[0] as boolean;
    };

    const mintDigitalId = () => {};

    const verifyDigitalData = () => {};

    return { hasDigitalId };
};

export default useDigitalId;
