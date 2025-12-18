// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import AuthProvider from "./context/AuthContext";

import "./index.css";
import "./styles/style.css";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/fonts.css";
import "./styles/trouble.css";
import "./styles/sidebar.css";
import "./styles/home.css";
import "./styles/footer.css";
import "./styles/layout.css";
import "./styles/profile.css";
import "./styles/myprofile.css";
import "./styles/createModal.css";
import "./styles/explore.css";
import "./styles/postActionsSheet.css";
import "./styles/editPostModal.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
