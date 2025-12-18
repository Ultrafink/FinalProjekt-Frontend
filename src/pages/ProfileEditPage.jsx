import { useEffect, useMemo, useRef, useState } from "react";
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
    avatar: "", // текущий аватар с сервера (absolute url)
  });

  const [initialForm, setInitialForm] = useState({
    username: "",
    website: "",
    about: "",
    avatar: "",
  });

  // ✅ draft avatar (не сохраняем на сервер до Save)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(""); // objectURL

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

  // ✅ рассчитываем dirty (учитываем выбранный avatarFile)
  useEffect(() => {
    const isDirty =
      form.username !== initialForm.username ||
      form.website !== initialForm.website ||
      form.about !== initialForm.about ||
      Boolean(avatarFile); // новый аватар выбран, но ещё не сохранён

    setDirty(isDirty);
  }, [form, initialForm, avatarFile]);

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

  // ✅ локально показываем превью, но НЕ сохраняем на сервер
  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    // чтобы можно было выбрать тот же файл повторно
    e.target.value = "";
  };

  // ✅ чистим objectURL чтобы не текла память
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleSave = async (e) => {
    e?.preventDefault?.();

    try {
      // 1) сохраняем текстовые поля
      await axios.patch("/users/me", {
        username: form.username,
        website: form.website,
        about: form.about,
      });

      // 2) если выбран файл — сохраняем аватар ТОЛЬКО тут
      if (avatarFile) {
        const data = new FormData();
        data.append("avatar", avatarFile);
        await axios.patch("/users/me/avatar", data);
      }

      // 3) подтягиваем актуального пользователя и обновляем общий state
      const meRes = await axios.get("/users/me");
      setMe?.(meRes.data);

      // 4) синхронизируем форму с сервером + сбрасываем draft
      applyMeToForm(meRes.data);

      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");
      setAvatarFile(null);

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

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const avatarSrc = useMemo(() => {
    return avatarPreview || form.avatar || "/icons/profile.png";
  }, [avatarPreview, form.avatar]);

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
            <img src={avatarSrc} alt="avatar" />
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
            onChange={onPickAvatar}
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
