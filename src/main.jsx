import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CallProvider } from "./context/CallContext";
import { ThemeProvider } from "./context/ThemeContext";
import { EncryptionProvider } from "./context/EncryptionContext";
import { DataProvider } from "./context/DataContext";
import App from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <EncryptionProvider>
            <DataProvider>
              <CallProvider>
                <App />
              </CallProvider>
            </DataProvider>
          </EncryptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
