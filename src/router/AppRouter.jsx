import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import TroubleLoggingInPage from "../pages/auth/TroubleLoggingInPage";

import HomePage from "../pages/HomePage";
import ProfileEditPage from "../pages/ProfileEditPage";
import ProfilePage from "../pages/ProfilePage";

import MainLayout from "../layouts/MainLayout";

import ProtectedLayout from "./ProtectedLayout";
import PublicOnlyLayout from "./PublicOnlyLayout";

import ExplorePage from "../pages/ExplorePage";

import ProfileRoutePage from "../pages/ProfileRoutePage";


export default function AppRouter() {
  return (
    <Routes>
      {/* 👤 Публичные страницы (только для гостей) */}
      <Route element={<PublicOnlyLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/accounts/password/reset"
          element={<TroubleLoggingInPage />}
        />
      </Route>

      {/* 🔒 Приватная часть (только для залогиненных) */}
      <Route element={<ProtectedLayout />}>
        {/* 🧱 Layout с сайдбаром */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/profile/:username" element={<ProfileRoutePage />} />
          <Route path="/explore" element={<ExplorePage />} />
        </Route>
      </Route>

      {/* ❓ Любой неизвестный путь */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
