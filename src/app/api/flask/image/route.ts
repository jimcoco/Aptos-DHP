import { NextRequest, NextResponse } from 'next/server';

const url = process.env.API_URL as string;

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const action = body.get('action');
        const image: File = body.get('image') as File;

        if (action != 'send' && action != 'upload') throw new Error('No action was provided');

        const formData = new FormData();
        formData.append('image', image);
        const response = await fetch(`${url}/${action}`, {
            method: 'POST',
            body: formData,
        });

        if (response.status != 200) throw new Error('Server Error');
        const json = await response.json();

        return NextResponse.json(
            { link: action == 'send' ? json.s3_url : json.imageURL },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: `An error occured ${error}` }, { status: 500 });
    }
}
