import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/useAuth";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    website: "",
    about: "",
    avatar: "",
  });

  const [initialForm, setInitialForm] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hideSaved, setHideSaved] = useState(false);

  const normalizeAvatarUrl = (value) => {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;

    const base = axios?.defaults?.baseURL || "";
    if (!base) return value;

    return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/me");
        const next = {
          username: res.data.username || "",
          website: res.data.website || "",
          about: res.data.about || "",
          avatar: normalizeAvatarUrl(res.data.avatar || ""),
        };
        setForm(next);
        setInitialForm(next);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const isDirty =
      form.username !== initialForm.username ||
      form.website !== initialForm.website ||
      form.about !== initialForm.about ||
      form.avatar !== initialForm.avatar;

    setDirty(isDirty);
  }, [form, initialForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "about" && value.length > 100) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

    try {
      await axios.patch("/users/me", {
        username: form.username,
        website: form.website,
        about: form.about,
      });

      setInitialForm({ ...form });
      setSaved(true);
      setHideSaved(false);

      setTimeout(() => setHideSaved(true), 2000);
      setTimeout(() => setSaved(false), 2300);
    } catch (err) {
      console.error("Save profile error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Save error";
      alert(msg);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    try {
      const res = await axios.patch("/users/me/avatar", data);
      setForm((prev) => ({
        ...prev,
        avatar: normalizeAvatarUrl(res.data.avatar),
      }));
    } catch (err) {
      console.error("Avatar upload error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Save error";
      alert(msg);
    } finally {
      e.target.value = "";
    }
  };

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <>
      {saved && (
        <div className={`save-toast ${hideSaved ? "hide" : ""}`}>
          Changes saved
        </div>
      )}

      <section className="profile-page">
        <h1 className="profile-title">Edit Profile</h1>

        <div className="profile-header-box">
          <div className="profile-avatar">
            {form.avatar ? <img src={form.avatar} alt="avatar" /> : <div className="avatar-placeholder" />}
          </div>

          <div className="profile-about-preview">
            <span className="profile-username">{form.username || "username"}</span>
            <p>{form.about || "Tell something about yourself"}</p>
          </div>

          <button
            type="button"
            className="new-photo-btn"
            onClick={() => fileRef.current?.click()}
          >
            New photo
          </button>

          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={uploadAvatar}
            accept="image/*"
          />
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
            />
          </label>

          <label>
            Website
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              autoComplete="off"
            />
          </label>

          <label>
            About
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              maxLength={100}
              autoComplete="off"
            />
            <div className="char-counter">{form.about.length} / 100</div>
          </label>

          <button
            type="submit"
            className={`save-btn ${!dirty ? "disabled" : ""}`}
            disabled={!dirty}
          >
            Save
          </button>

          {/* Logout */}
          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            style={{ marginTop: 12 }}
          >
            Log out
          </button>
        </form>
      </section>
    </>
  );
}
