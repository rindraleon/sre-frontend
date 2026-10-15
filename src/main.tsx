import "@fontsource-variable/manrope";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SreProvider } from "@/context/SreContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SreProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
