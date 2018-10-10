import {BrowserWindow} from 'electron';

interface PKCEPair {
    verifier: string,
    challenge: string
}

interface ElectronAuth0LoginConfig {
    mainWindow?: BrowserWindow,
    useRefreshToken?: boolean
}