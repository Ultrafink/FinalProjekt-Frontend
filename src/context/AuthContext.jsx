import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import { getToken } from "../utils/auth";
import { AuthContext } from "./authContextInstance";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoadingMe(false);
      return;
    }

    setLoadingMe(true);
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoadingMe(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ user, setUser, refreshMe, loadingMe }),
    [user, refreshMe, loadingMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
