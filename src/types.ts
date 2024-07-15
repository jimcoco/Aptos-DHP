export interface DigitalId {
    name: string;
    digitalIdAddress: string;
    faceIpfsHash: string;
    irisAddress?: string;
    fingerprintAddress?: string;
}

export enum State {
    Running,
    Stopped,
    Stopping,
}
