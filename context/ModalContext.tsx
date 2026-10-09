"use client";

import { createContext, useContext, useState } from "react";
import { SEASON_ONE_MODE } from "@/lib/seasonOne";

type ModalType = "contact" | "enroll" | "seasonOne" | null;

type ModalContextType = {
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  activeModal: ModalType;
};

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
  activeModal: null,
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        // Season 01 mode: every "Enroll" opens the waitlist popup instead.
        openModal: (type) => setActiveModal(SEASON_ONE_MODE && type === "enroll" ? "seasonOne" : type),
        closeModal: () => setActiveModal(null),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
