import { NextRequest, NextResponse } from 'next/server';

const url = process.env.AWS_URL as string;

const requestHeaders = new Headers();
requestHeaders.set('authorizationToken', process.env.AWS_TOKEN as string);

export async function GET() {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: requestHeaders,
        });
        if (response.status != 200) throw new Error('Server Error');

        const json = await response.json();
        const state = JSON.parse(json.body).state;

        return NextResponse.json({ state }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `An error occured ${error}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (body.action != 'start' && body.action != 'stop')
            throw new Error('Action was not provided');

        return body.action == 'start' ? await startServer() : await stopServer();
    } catch (error) {
        return NextResponse.json({ error: `An error occured ${error}` }, { status: 500 });
    }
}

async function stopServer() {
    const response = await fetch(`${url}/stop-instance`, {
        method: 'POST',
        headers: requestHeaders,
    });

    if (response.status != 200)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });

    const doubleCheck = await GET();
    if ((await doubleCheck.json()).state != 'stopping')
        return NextResponse.json({ message: 'Still Working' }, { status: 500 });

    return NextResponse.json({ message: 'Stopping' }, { status: 200 });
}

async function startServer() {
    const response = await fetch(`${url}/startflaskapp`, {
        method: 'POST',
        headers: requestHeaders,
    });

    if (response.status != 200)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });

    return NextResponse.json({ message: 'Starting' }, { status: 200 });
}
