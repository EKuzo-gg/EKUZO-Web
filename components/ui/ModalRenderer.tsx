"use client";

import { useModal } from "@/context/ModalContext";
import ContactModal from "./ContactModal";
import EnrollModal from "./EnrollModal";
import SeasonOnePopup from "./SeasonOnePopup";

export default function ModalRenderer() {
  const { activeModal } = useModal();
  if (!activeModal) return null;
  if (activeModal === "contact") return <ContactModal />;
  if (activeModal === "enroll") return <EnrollModal />;
  if (activeModal === "seasonOne") return <SeasonOnePopup />;
  return null;
}
