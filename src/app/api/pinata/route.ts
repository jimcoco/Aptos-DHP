import { NextRequest, NextResponse } from 'next/server';

import PinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

import { encrypt, decrypt } from '@/utils/crypto-utils';

const pinata = new PinataSDK({
    pinataApiKey: process.env.PINATA_API,
    pinataSecretApiKey: process.env.PINATA_SECRET,
});

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const ipfsHash = searchParams.get('ipfsHash') as string;

        const pinList = await pinata.pinList({
            hashContains: ipfsHash,
        });
        const name = (pinList.rows[0].metadata.name as string).split(' - ')[0];
        const key = (pinList.rows[0].metadata.keyvalues as any).key as string;

        const response = await fetch(`${process.env.PINATA_URL}${ipfsHash}`);
        const digitalId = await response.json();

        const faceIpfsHash = decrypt(digitalId.attributes[0].value, key);
        const faceResponse = await fetch(`${process.env.PINATA_URL}${faceIpfsHash}`);
        const faceLink = await faceResponse.json();
        return NextResponse.json({ name, objLink: faceLink }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error, name: 'Null', objLink: '' }, { status: 500 });
    }
}

let tries = 1;
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const personName = formData.get('personName') as string;
        const key = formData.get('key') as string;
        const faceData = formData.get('faceData') as string;

        if (!personName) throw new Error('No name was provided');
        if (!faceData) throw new Error('No face data was provided');
        if (!key) throw new Error('No key was provided');

        const faceDataHashed = await pinata.pinJSONToIPFS(
            {
                link: faceData,
            },
            {
                pinataMetadata: {
                    name: `${personName} - Face`,
                },
            }
        );
        const pinataResponse = await pinata.pinJSONToIPFS(
            {
                name: 'Digital ID',
                image: `${process.env.PINATA_URL}${process.env.ID_IMAGE}`,
                attributes: [{ trait_type: 'Face', value: encrypt(faceDataHashed.IpfsHash, key) }],
            },
            {
                pinataMetadata: {
                    name: `${personName} - Digital ID`,
                    // @ts-ignore
                    keyvalues: {
                        key: key,
                    },
                },
            }
        );

        return NextResponse.json({ ipfsHash: pinataResponse.IpfsHash }, { status: 200 });
    } catch (error) {
        console.log(error);
        if (tries > 3) return NextResponse.json({ error }, { status: 500 });

        tries++;
        return await POST(request);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body: {
            dataType: 'iris' | 'fingerprint';
            image: any;
            digitalIdHash: string;
        } = await request.json();

        if (body.dataType != 'iris' && body.dataType != 'fingerprint')
            throw new Error('Wrong data type');
        if (!body.image) throw new Error('No image was provided');
        if (!body.digitalIdHash) throw new Error('No digital id hash was provided');

        const pinList = await pinata.pinList({ hashContains: body.digitalIdHash });
        const personName = (pinList.rows[0].metadata.name as string).split(' - ')[0];
        const key = (pinList.rows[0].metadata.keyvalues as any).key;

        const imageDataHash = await pinAndEncrypt(body.image.data, personName, key, body.dataType);
        const isIris = body.dataType == 'iris';
        const pinataResponse = await pinata.pinJSONToIPFS(
            {
                name: `${personName} - ${isIris ? 'Iris' : 'Fingerprint'}`,
                image: `${process.env.PINATA_URL}${
                    isIris ? process.env.IRIS_IMAGE : process.env.FINGERPRINT_IMAGE
                }`,
                attributes: [{ trait_type: isIris ? 'Iris' : 'Fingerprint', value: imageDataHash }],
            },
            {
                pinataMetadata: {
                    name: `${personName} - ${isIris ? 'Iris' : 'Fingerprint'}`,
                },
            }
        );

        const response = await fetch(`${process.env.PINATA_URL}${body.digitalIdHash}`);
        const digitalId = await response.json();
        digitalId.attributes.push({
            trait_type: isIris ? 'Iris' : 'Fingerprint',
            value: pinataResponse.IpfsHash,
        });

        await pinata.unpin(body.digitalIdHash);
        const updatedPinataResponse = await pinata.pinJSONToIPFS(digitalId, {
            pinataMetadata: {
                name: `${personName} - Digital ID`,
                // @ts-ignore
                keyvalues: {
                    key,
                },
            },
        });

        return NextResponse.json(
            {
                dataIpfsHash: pinataResponse.IpfsHash,
                digitaIdIpfsHash: updatedPinataResponse.IpfsHash,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

async function pinAndEncrypt(
    file: Buffer,
    name: string,
    key: string,
    dataType: 'iris' | 'fingerprint'
) {
    const pinnedData = await pinata.pinFileToIPFS(Readable.from(Buffer.from(file)), {
        pinataMetadata: {
            name: `${name} - ${dataType == 'iris' ? 'Iris' : 'Fingerprint'}`,
        },
    });

    return encrypt(pinnedData.IpfsHash, key);
}
