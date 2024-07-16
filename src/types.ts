export interface DigitalId {
    name: string;
    digitalIdAddress: string;
    faceLink: string;
    irisAddress?: string;
    fingerprintAddress?: string;
}

export enum State {
    Running,
    Stopped,
    Stopping,
}
