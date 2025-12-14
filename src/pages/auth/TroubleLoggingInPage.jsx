import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";
import lockImg from "../../assets/trouble.png";

export default function TroubleLoggingInPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("/auth/reset-password", { emailOrUsername });
      setMessage(res.data.message || "Instructions sent to your email");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending instructions");
    }
  };

  return (
    <div className="trouble-page">
      <div className="trouble-box">

        {/* Замок */}
        <img src={lockImg} alt="Lock Icon" className="lock-icon" />

        <h2>Trouble Logging In?</h2>
        <p>Enter your email, phone, or username and we'll send you instructions to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email, Phone, or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="trouble-input"
          />
          <button type="submit" className="blue-btn">Send Login Link</button>
        </form>

        {message && <p className="server-message">{message}</p>}

        {/* OR Create New Account под чертой */}
        <div className="or-container">
          <div className="line"></div>
          <span className="or-text">OR</span>
          <div className="line"></div>
        </div>
        <div className="create-account">
          <Link to="/signup">Create New Account</Link>
        </div>

        {/* Back to login внизу, на всю ширину, только верхняя граница */}
        <Link to="/login" className="back-login-btn">Back to login</Link>
      </div>
    </div>
  );
}
