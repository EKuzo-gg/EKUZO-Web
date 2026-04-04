"use client";

import { useState } from "react";
import { useModal } from "@/context/ModalContext";

export default function ContactModal() {
  const { closeModal } = useModal();
  const [contactMethod, setContactMethod] = useState<"email" | "text">("email");
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          organization: formData.organization,
          contactMethod,
          ...(contactMethod === "email"
            ? { email: formData.email }
            : { phone: formData.phone }),
          message: formData.message,
          pageUrl: window.location.href,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="relative bg-white w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 z-10 p-1 hover:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2 18L18 2M2 2L18 18"
              stroke="#2F384C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="p-8 pt-12">
          {submitted ? (
            <div className="py-8 text-center">
              <h2 className="font-body font-bold text-black text-2xl mb-4">
                Thanks for reaching out!
              </h2>
              <p className="font-body text-black/70">
                We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h2 className="font-body font-bold text-black text-2xl md:text-3xl">
                Talk to Humans
              </h2>

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-name"
                  className="font-body font-medium text-black text-sm"
                >
                  Name <span className="text-red">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors"
                  placeholder="Your full name"
                />
              </div>

              {/* Organization */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-org"
                  className="font-body font-medium text-black text-sm"
                >
                  Organization
                </label>
                <input
                  id="contact-org"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  className="font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors"
                  placeholder="School, org, or company (optional)"
                />
              </div>

              {/* Preferred contact method */}
              <div className="flex flex-col gap-3">
                <p className="font-body font-medium text-black text-sm">
                  Preferred contact method
                </p>
                <div className="flex gap-6">
                  {(["email", "text"] as const).map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 cursor-pointer font-body text-sm text-black"
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={contactMethod === method}
                        onChange={() => setContactMethod(method)}
                        className="accent-red"
                      />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </label>
                  ))}
                </div>

                {contactMethod === "email" ? (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-email"
                      className="font-body font-medium text-black text-sm"
                    >
                      Email address <span className="text-red">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-phone"
                      className="font-body font-medium text-black text-sm"
                    >
                      Phone number <span className="text-red">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors"
                      placeholder="+1 (000) 000-0000"
                    />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-message"
                  className="font-body font-medium text-black text-sm"
                >
                  What are you hoping to explore
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors resize-none"
                  placeholder="Tell us a bit about what you're looking for…"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-body font-bold text-white text-base bg-red py-4 rounded-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
