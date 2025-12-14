import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setServerError("");

      const res = await axios.post("http://localhost:5000/auth/register", data);

      if (res.data.message === "User registered successfully") {
        navigate("/login"); // переходим на логин
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">

        <h1 className="logo">Instagram</h1>

        <p className="subtitle">
          Sign up to see photos and videos from your friends.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          {errors.email && <span>Email is required</span>}

          <input
            type="text"
            placeholder="Full Name"
            {...register("fullName", { required: true })}
          />
          {errors.fullName && <span>Full name is required</span>}

          <input
            type="text"
            placeholder="Username"
            {...register("username", { required: true })}
          />
          {errors.username && <span>Username is required</span>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: true, minLength: 6 })}
          />
          {errors.password && <span>Password must be 6+ chars</span>}

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit">Sign up</button>
        </form>

        <div className="switch-box">
          Have an account? <Link to="/login">Log in</Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
