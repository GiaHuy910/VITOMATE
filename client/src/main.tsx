import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./public/css/app.css";
import App from "./App.tsx";

import { AuthProvider } from "./contexts/AuthProvider.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <AuthProvider>
    <StrictMode>
      <App />,
    </StrictMode>
    ,
  </AuthProvider>,
);
