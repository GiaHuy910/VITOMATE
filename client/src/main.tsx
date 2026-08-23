import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./public/css/app.css";
import App from "./App.tsx";

import { AuthProvider } from "./contexts/auth/AuthProvider.tsx";
import { ThemeProvider } from "./contexts/theme/ThemeProvider.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <AuthProvider>
    <ThemeProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ThemeProvider>
  </AuthProvider>,
);
