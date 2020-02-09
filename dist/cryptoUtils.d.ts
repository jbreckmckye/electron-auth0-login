export interface PKCEPair {
    verifier: string;
    challenge: string;
}
export declare function getPKCEChallengePair(): PKCEPair;
