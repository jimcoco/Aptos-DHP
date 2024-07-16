/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_MODULE: '90feb54f2b1342929bc52b78b2a3eec093c9836805d0373590cb669fff0a4b80',

        PINATA_API: '0a7afcd01ae3603e96a9',
        PINATA_SECRET: '1610c124fb664324d1c9d1fa0fccf15af524e533df2916aef8eb59e99c83b453',
        PINATA_URL: 'https://rose-principal-turtle-588.mypinata.cloud/ipfs/',

        ID_IMAGE: 'QmXW4ojVRb7QxzSZJp8qGRsNqJXxHvQGQDfDR43KsGS1RJ',
        IRIS_IMAGE: 'QmfRu5WbaeFrZhAL73bgkuoEMz7GsdYKLkEkLvcyx68B4r',
        FINGERPRINT_IMAGE: 'QmSkHHy2Jyiw9EDCV611hmdj9fvHbfQcx6YY5QKsGap7CB',

        AWS_URL: 'https://28g5pjoyra.execute-api.ap-southeast-1.amazonaws.com/prod/flaskapp',
        AWS_TOKEN: 'blendAVAX2024',
        API_URL: 'https://blend-server.vercel.app/aws',
    },
};

export default nextConfig;
