import { createContext, useContext } from "react";

export const ModalCtx = createContext(null);

export function useModals() {
  const ctx = useContext(ModalCtx);
  if (!ctx) throw new Error("useModals must be used inside <ModalProvider/>");
  return ctx;
}
