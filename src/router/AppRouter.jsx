import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import TroubleLoggingInPage from "../pages/auth/TroubleLoggingInPage";


import HomePage from "../pages/HomePage";
import MainLayout from "../layouts/MainLayout";

import ProfileEditPage from "../pages/ProfileEditPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* 🔐 AUTH — БЕЗ сайдбара */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/accounts/password/reset"
        element={<TroubleLoggingInPage />}
      />

      {/* 🧱 ОСНОВНОЕ ПРИЛОЖЕНИЕ — С сайдбаром */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfileEditPage />} />
      </Route>
    </Routes>
  );
}
