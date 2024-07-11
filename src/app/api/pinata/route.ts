import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

import PinataSDK from '@pinata/sdk';

const pinata = new PinataSDK({
    pinataApiKey: process.env.PINATA_API,
    pinataSecretApiKey: process.env.PINATA_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.personName) throw new Error('No name was provided');
        if (!body.faceData) throw new Error('No face data was provided');

        const faceDataHash = 'some face data hash'; //todo pin obj file and then hash ipfsHash

        const pinataResponse = await pinata.pinJSONToIPFS(
            {
                name: 'Digital ID',
                image: `${process.env.PINATA_URL}${process.env.ID_IMAGE}`,
                attributes: [{ trait_type: 'Face', value: faceDataHash }],
            },
            {
                pinataMetadata: {
                    name: `${body.personName} - Digital ID`,
                },
            }
        );

        return NextResponse.json({ ipfsHash: pinataResponse.IpfsHash }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.dataType != 'iris' && body.dataType != 'fingerprint')
            throw new Error('Wrong data type');
        if (!body.image) throw new Error('No image was provided');
        if (!body.digitalIdHash) throw new Error('No digital id hash was provided');

        const pinList = await pinata.pinList({ hashContains: body.digitalIdHash });
        const personName = (pinList.rows[0].metadata.name as string).split(' - ')[0];

        const imageDataHash = 'some hash'; //todo fs.createReadStream() and read the image then hash the ipfsHash
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
