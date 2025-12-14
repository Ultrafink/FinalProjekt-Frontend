import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import phoneImg from "../../assets/landing-2x.png";
import axios from "../../utils/axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", {
        email: emailOrUsername,
        password,
      });

      // сохраняем JWT
      localStorage.setItem("token", res.data.token);

      // редирект на домашнюю страницу
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Левый блок — телефон с скриншотами (только десктоп) */}
        <div className="login-left">
          <img src={phoneImg} alt="Phone screens" className="login-left-img" />
        </div>

        {/* Правый блок — форма */}
        <div className="login-right">
          {/* Карточка логина */}
          <div className="login-card">
            <img
              src="https://i.imgur.com/zqpwkLQ.png"
              alt="Instagram"
              className="login-logo"
            />

            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Phone number, username, or email"
                className="login-input"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button className="login-button" type="submit">
                Log In
              </button>

              {error && <p className="server-error">{error}</p>}

              <div className="or-container">
                <div className="line"></div>
                <span className="or-text">OR</span>
                <div className="line"></div>
              </div>

              <a href="#" className="facebook-login">
                <svg
                  aria-label="Facebook"
                  fill="#385185"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
                Log in with Facebook
              </a>

              <Link to="/accounts/password/reset" className="forgot-link">
                Forgot password?
              </Link>
            </form>
          </div>

          {/* Карточка Sign Up */}
          <div className="signup-card">
            <p>
              Don’t have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
