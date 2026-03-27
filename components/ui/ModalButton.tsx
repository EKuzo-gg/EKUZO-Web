"use client";

import { useModal } from "@/context/ModalContext";
import Button from "./Button";

type ModalButtonProps = {
  modal: "contact" | "enroll";
  variant?: "red-filled" | "red-outlined" | "white-filled" | "white-outlined";
  children: React.ReactNode;
  className?: string;
};

export default function ModalButton({
  modal,
  variant = "red-outlined",
  children,
  className = "",
}: ModalButtonProps) {
  const { openModal } = useModal();
  return (
    <Button variant={variant} onClick={() => openModal(modal)} className={className}>
      {children}
    </Button>
  );
}
