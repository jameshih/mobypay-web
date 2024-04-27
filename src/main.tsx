import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import AccountProvider from "./providers/AccountProvider.tsx";
// import { AccountProvider } from "./hooks/useAccount.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountProvider>
      <App />
    </AccountProvider>
  </React.StrictMode>
);
