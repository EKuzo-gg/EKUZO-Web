"use client";

import Link from "next/link";
import { useModal } from "@/context/ModalContext";

const programs = [
  {
    label: "EKUZOTEAMS – Semester-Based",
    href: "/ekuzo-teams",
  },
  {
    label: "EKUZO100 – 4-Week Intro",
    href: "/ekuzo100",
  },
  {
    label: "EKUZOCamps – Seasonal",
    href: "/ekuzo-camps",
  },
];

export default function EnrollModal() {
  const { closeModal } = useModal();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="relative bg-white w-full max-w-[640px] rounded-sm shadow-2xl overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={closeModal}
            className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="-1 -1 12 12" fill="none">
              <path
                d="M0 10L10 0M0 0L10 10"
                stroke="#2F384C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-8 pt-2 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-body font-bold text-black text-2xl md:text-3xl">
              Enroll my gamer
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-body text-black/60 text-sm">Select a program</p>
            <div className="flex flex-col gap-3">
              {programs.map((program) => (
                <Link
                  key={program.href}
                  href={program.href}
                  onClick={closeModal}
                  className="w-full font-body font-medium text-black text-base border border-black/20 rounded-sm px-5 py-4 hover:border-black transition-colors flex items-center justify-between group"
                >
                  <span>{program.label}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
