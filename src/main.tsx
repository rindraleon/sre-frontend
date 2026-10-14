import "@fontsource-variable/manrope";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApplicationSre } from "./application";
import { FournisseurAuthentificationSre } from "@/contexte/contexte-authentification-sre";
import { FournisseurSre } from "@/contexte/contexte-sre";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FournisseurSre>
        <FournisseurAuthentificationSre>
          <ApplicationSre />
        </FournisseurAuthentificationSre>
      </FournisseurSre>
    </BrowserRouter>
  </React.StrictMode>,
);
