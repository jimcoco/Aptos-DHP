import Image from 'next/image';
import Link from 'next/link';

interface Props {
    name: string;
    objectAddress?: string;
}

export default function BiometricsStatus({ name, objectAddress }: Props) {
    return (
        <div className='biometrics-method'>
            <div className='appearence'>
                <Image
                    src={`/icons/${name.toLocaleLowerCase()}.png`}
                    alt='biomertics-method'
                    height={42}
                    width={42}
                    style={{ opacity: objectAddress ? '1' : '0.3' }}
                />
                <h6 style={{ color: objectAddress ? '' : 'var(--light-gray)' }}>{name}</h6>
            </div>

            {objectAddress ? (
                <div className='status'>
                    <Image src={`/icons/verified.png`} alt='verified' height={16} width={16} />
                    <Link
                        href={`https://explorer.aptoslabs.com/object/${objectAddress}?network=devnet`}
                    >
                        Verified on Aptos
                    </Link>
                </div>
            ) : (
                <Link id='green-button' href={`/data/${name.toLocaleLowerCase()}`}>
                    Verify
                </Link>
            )}
        </div>
    );
}
