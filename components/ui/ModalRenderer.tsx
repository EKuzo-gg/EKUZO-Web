"use client";

import { useModal } from "@/context/ModalContext";
import ContactModal from "./ContactModal";
import EnrollModal from "./EnrollModal";

export default function ModalRenderer() {
  const { activeModal } = useModal();
  if (!activeModal) return null;
  if (activeModal === "contact") return <ContactModal />;
  if (activeModal === "enroll") return <EnrollModal />;
  return null;
}
