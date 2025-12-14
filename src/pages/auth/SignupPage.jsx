import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await axios.post("/auth/register", data);

      if (res.data.message === "User registered successfully") {
        navigate("/login");
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png"
          alt="Instagram Logo"
          className="logo"
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && <span className="error">{errors.fullName.message}</span>}

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && <span className="error">{errors.username.message}</span>}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}

          {/* Ошибка сервера (например, username/email уже существует) */}
          {serverError && <p className="error">{serverError}</p>}

          <button type="submit" className="blue-btn">Sign up</button>
        </form>

        <div className="switch-box">
          Have an account? <Link to="/login" className="login-link">Log in</Link>
        </div>
      </div>
    </div>
  );
}
