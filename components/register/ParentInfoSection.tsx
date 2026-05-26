"use client";

import InputField from "./InputField";
import type { ParentInfo } from "@/hooks/useRegisterForm";

// Shared Parent Info section. Lifted verbatim from the three register
// pages where the four fields (first, last, email, phone) and the h2
// heading were identical. The email field fires `onEmailBlur` so the
// form's email-lead capture hook can subscribe the address to Beehiiv
// with the product's `form_started_*` tag without blocking the form.

export default function ParentInfoSection({
  parent,
  setParent,
  onEmailBlur,
  formatPhone,
}: {
  parent: ParentInfo;
  setParent: (updater: (prev: ParentInfo) => ParentInfo) => void;
  onEmailBlur: () => void;
  // E100 formats the phone field as the user types ("(555) 123-4567");
  // camps + teams accept raw input. Default = identity.
  formatPhone?: (v: string) => string;
}) {
  const phoneFormatter = formatPhone ?? ((v: string) => v);
  return (
    <div className="mb-12">
      <h2
        className="font-display uppercase text-black leading-[0.85] mb-8"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
      >
        Parent Info
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        <InputField
          label="Parent first name *"
          required
          errorKey="parent.firstName"
          value={parent.firstName}
          onChange={(v) => setParent((p) => ({ ...p, firstName: v }))}
          placeholder="Enter first name"
        />
        <InputField
          label="Parent last name *"
          required
          errorKey="parent.lastName"
          value={parent.lastName}
          onChange={(v) => setParent((p) => ({ ...p, lastName: v }))}
          placeholder="Enter last name"
        />
        <InputField
          label="Email *"
          type="email"
          required
          errorKey="parent.email"
          value={parent.email}
          onChange={(v) => setParent((p) => ({ ...p, email: v }))}
          onBlur={onEmailBlur}
          placeholder="your.email@example.com"
        />
        <InputField
          label="Phone number *"
          type="tel"
          errorKey="parent.phone"
          value={parent.phone}
          onChange={(v) => setParent((p) => ({ ...p, phone: phoneFormatter(v) }))}
          placeholder="(555) 123-4567"
        />
      </div>
    </div>
  );
}
