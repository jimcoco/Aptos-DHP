interface PageProps {
    name: string;
    description: string;
    device: Device;
    upload: UploadData;
}

interface Device {
    image: string;
    name: string;
    by: string;
}

interface UploadData {
    image: string;
    name: string;
    by: string;
    buttonText: string;
}

const face: PageProps = {
    name: 'Face Data Collection',
    description:
        'The digital human ID created required detailed face data which will be collected in this process.',
    device: {
        image: '/images/face-scanner.png',
        name: 'HUMAN Scanner',
        by: 'By RAYFace',
    },
    upload: {
        image: '/images/face-image.svg',
        name: 'Deep Face AI Engine',
        by: 'By DHP Research Team',
        buttonText: 'Upload Your Selfie',
    },
};

const fingerprint: PageProps = {
    name: 'Fingerprint Verification',
    description:
        'The digital human ID fingerprint verification required detailed fingerprint data which will be collected in this process.',
    device: {
        image: '/images/fingerprint-scanner.png',
        name: 'FINGERPRINT Scanner',
        by: 'By Aratek',
    },
    upload: {
        image: '/images/finger-image.svg',
        name: 'Direct Upload',
        by: 'Managed by DHP',
        buttonText: 'Upload Fingerprint Data',
    },
};

const iris: PageProps = {
    name: 'Iris Verification',
    description:
        'The digital human ID iris verification required detailed iris data which will be collected in this process.',
    device: {
        image: '/images/iris-scanner.png',
        name: 'IRIS Scanner',
        by: 'By Homsh Technology',
    },
    upload: {
        image: '/images/iris-image.svg',
        name: 'Direct Upload',
        by: 'Managed by DHP',
        buttonText: 'Upload Iris Data',
    },
};

const data: { [key: string]: PageProps } = {
    face,
    fingerprint,
    iris,
};

export default data;
