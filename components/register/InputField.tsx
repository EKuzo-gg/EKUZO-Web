"use client";

// Shared register-form input primitive. Lifted verbatim from the three
// register pages where it appeared identically. The `errorKey` doubles
// as the input id + the data-error-key attribute, which the form's
// scroll-to-first-error logic queries.

export default function InputField({
  label,
  required,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  errorKey,
  hint,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  errorKey?: string;
  // Small warning/info line rendered under the input (e100 uses this
  // for age-boundary warnings against the selected cohort start).
  hint?: string | null;
}) {
  return (
    <div
      className="flex flex-col gap-2"
      style={errorKey ? { scrollMarginTop: "100px" } : undefined}
    >
      <label
        htmlFor={errorKey}
        className="font-body font-bold text-[#374151]"
        style={{ fontSize: "14px", lineHeight: "20px" }}
      >
        {label}
      </label>
      <input
        id={errorKey}
        data-error-key={errorKey}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="font-body text-[#0a0a0a] bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#9ca3af]"
        style={{ fontSize: "16px", lineHeight: "normal" }}
      />
      {hint && (
        <p className="font-body text-[#c2410c] text-xs leading-4">{hint}</p>
      )}
    </div>
  );
}
