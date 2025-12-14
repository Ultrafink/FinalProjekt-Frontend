import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import TroubleLoggingInPage from "../pages/auth/TroubleLoggingInPage";

import HomePage from "../pages/HomePage";
import Sidebar from "../components/Sidebar";

export default function AppRouter() {
  return (
    <div className="app-layout">
      {/* Сайдбар отображается на всех страницах КРОМЕ логина/регистрации */}
      <Routes>

        {/* AUTH PAGES (без сайдбара) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/accounts/password/reset" element={<TroubleLoggingInPage />} />

        {/* MAIN APP (с сайдбаром) */}
        <Route
          path="/home"
          element={
            <div className="app-content">
              <Sidebar />
              <HomePage />
            </div>
          }
        />

      </Routes>
    </div>
  );
}
