import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/useAuth";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const outlet = useOutletContext() || {};
  const setMe = outlet.setMe;

  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    website: "",
    about: "",
    avatar: "",
  });

  const [initialForm, setInitialForm] = useState({
    username: "",
    website: "",
    about: "",
    avatar: "",
  });

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

  const applyMeToForm = (meData) => {
    const next = {
      username: meData?.username || "",
      website: meData?.website || "",
      about: meData?.about || "",
      avatar: normalizeAvatarUrl(meData?.avatar || ""),
    };
    setForm(next);
    setInitialForm(next);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await axios.get("/users/me");
        if (!alive) return;
        applyMeToForm(res.data);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const showSavedToast = () => {
    setSaved(true);
    setHideSaved(false);
    setTimeout(() => setHideSaved(true), 2000);
    setTimeout(() => setSaved(false), 2300);
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

    try {
      await axios.patch("/users/me", {
        username: form.username,
        website: form.website,
        about: form.about,
      });

      // подтягиваем актуального юзера и обновляем общий state (Sidebar обновится)
      const meRes = await axios.get("/users/me");
      setMe?.(meRes.data);

      // синхронизируем форму
      applyMeToForm(meRes.data);
      showSavedToast();
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
      await axios.patch("/users/me/avatar", data);

      // снова берём "me" как source-of-truth и обновляем Sidebar + форму
      const meRes = await axios.get("/users/me");
      setMe?.(meRes.data);
      applyMeToForm(meRes.data);
      showSavedToast();
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
            {form.avatar ? (
              <img src={form.avatar} alt="avatar" />
            ) : (
              <div className="avatar-placeholder" />
            )}
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
