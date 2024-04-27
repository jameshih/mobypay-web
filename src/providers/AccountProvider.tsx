import { useState } from "react";
import { Account, AccountContext } from "../contexts/account";
type Props = {
    children?: React.ReactNode
}
function AccountProvider({ children }: Props) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();

    // Function to update accounts
    const updateAccounts = (newAccounts: Account[]) => {
        setAccounts(newAccounts);
    };

    // Function to select an account
    const selectAccount = (account: Account | undefined) => {
        setSelectedAccount(account);
    };

    return (
        <AccountContext.Provider
            value={{ accounts, selectedAccount, updateAccounts, selectAccount }}
        >
            {children}
        </AccountContext.Provider>
    );
}

export default AccountProvider;