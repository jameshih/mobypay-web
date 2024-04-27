import { createContext } from "react";

export type KeypairType = 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum';
export type Account = {
    address: string;
    meta: {
        genesisHash?: string | null;
        name?: string;
        source: string;
    };
    type?: KeypairType;
}
export type AccountContextType = {


    accounts: Account[],
    selectedAccount: Account | undefined,
    updateAccounts: (accounts: Account[]) => void,
    selectAccount: (account: Account | undefined) => void,


}
export const AccountContext = createContext<AccountContextType>({

    accounts: [],
    selectedAccount: undefined,
    updateAccounts: () => { },
    selectAccount: () => { },

});