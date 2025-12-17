import { useEffect, useState, useRef } from "react";
import axios from "../utils/axios";

export default function ProfileEditPage() {
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

  // 🔹 Загрузка профиля
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/me");
        setForm({
          username: res.data.username || "",
          website: res.data.website || "",
          about: res.data.about || "",
          avatar: res.data.avatar || "",
        });
        setInitialForm({
          username: res.data.username || "",
          website: res.data.website || "",
          about: res.data.about || "",
          avatar: res.data.avatar || "",
        });
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Проверка dirty-state
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
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.patch("/users/me", {
        username: form.username,
        website: form.website,
        about: form.about,
      });

      setInitialForm({ ...form });
      setSaved(true);
      setHideSaved(false);

      // плавное исчезновение
      setTimeout(() => setHideSaved(true), 2000);
      setTimeout(() => setSaved(false), 2300);
    } catch (err) {
      console.error(err);
      alert("Save error");
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    try {
      const res = await axios.patch("/users/me/avatar", data);
      setForm({ ...form, avatar: res.data.avatar });
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Save error");
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <>
      {/* 🔥 TOAST */}
      {saved && (
        <div className={`save-toast ${hideSaved ? "hide" : ""}`}>
          Changes saved
        </div>
      )}

      <section className="profile-page">
        <h1 className="profile-title">Edit Profile</h1>

        {/* 🔹 верхний контейнер */}
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

          <button className="new-photo-btn" onClick={() => fileRef.current.click()}>
            New photo
          </button>

          <input type="file" hidden ref={fileRef} onChange={uploadAvatar} />
        </div>

        {/* 🔹 форма */}
        <div className="profile-form">
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
            className={`save-btn ${!dirty ? "disabled" : ""}`}
            onClick={handleSave}
            disabled={!dirty}
          >
            Save
          </button>
        </div>
      </section>
    </>
  );
}
