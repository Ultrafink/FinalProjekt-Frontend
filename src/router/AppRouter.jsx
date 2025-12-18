import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import TroubleLoggingInPage from "../pages/auth/TroubleLoggingInPage";

import HomePage from "../pages/HomePage";
import ProfileEditPage from "../pages/ProfileEditPage";
import ProfilePage from "../pages/ProfilePage";

import MainLayout from "../layouts/MainLayout";

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

      {/* 🧱 ПРИЛОЖЕНИЕ — С сайдбаром */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />

        {/* ✏️ редактирование профиля */}
        <Route path="/profile/edit" element={<ProfileEditPage />} />

        {/* 👤 профиль пользователя */}
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
