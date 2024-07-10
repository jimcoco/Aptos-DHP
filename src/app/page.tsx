import Image from 'next/image';
import Link from 'next/link';

import './home.css';

export default function Home() {
    return (
        <main className='home'>
            <Image id='gray-logo' src='/icons/logo.svg' alt='logo' width={43} height={39} />
            <h1>Digital Human Project</h1>
            <h5>The Only Proof of Personhood on Aptos.</h5>
            <div className='buttons'>
                <Link id='green-button' href='/connect'>
                    <Image src='/icons/aptos.svg' alt='aptos' width={20} height={20} />
                    Generate Identity
                </Link>
                <button id='gray-button'>Connect Identity</button>
            </div>
            <div className='participants'>1 unique human participated</div>
            <Image
                className='planet'
                src='/images/planet.png'
                alt='planet'
                width={1280}
                height={362}
            />
        </main>
    );
}
