import React, { createContext, useState, useContext } from "react";

// Create a context
const AccountContext = createContext();

// Provider component
function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Function to update accounts
  const updateAccounts = (newAccounts) => {
    setAccounts(newAccounts);
  };

  // Function to select an account
  const selectAccount = (account) => {
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

export { AccountProvider, AccountContext };
