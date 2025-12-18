import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // <-- добавляем
import "./index.css";
import App from "./App.jsx";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>   {/* <-- оборачиваем App */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
