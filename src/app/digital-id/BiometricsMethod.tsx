import Image from 'next/image';
import Link from 'next/link';

interface Props {
    image: string;
    name: string;
    href: string;
}

export default function BiometricsMethod({ image, name, href }: Props) {
    return (
        <div className='biometrics-method'>
            <div>
                <Image src={`/icons/${image}`} alt='biomertics-method' height={42} width={42} />
                <h6>{name}</h6>
            </div>

            <Link id='green-button' href={href}>
                Verify
            </Link>
        </div>
    );
}
