"use client";

import { createContext, useContext, useState } from "react";

type ModalType = "contact" | "enroll" | null;

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
        openModal: setActiveModal,
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
