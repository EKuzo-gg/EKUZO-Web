"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useModal } from "@/context/ModalContext";

type NavVariant = "dark" | "light" | "light-red";

const programsSubmenu = [
  { href: "/programs/ekuzo-teams", label: "EKUZO Teams", description: "School-based semester program" },
  { href: "/programs/ekuzo100",    label: "EKUZO 100",   description: "4-week individual program" },
  { href: "/programs/ekuzo-camps", label: "EKUZO Camps",  description: "Seasonal week-long camps" },
];

const navLinks = [
  { href: "/programs",    label: "Programs", hasSubmenu: true },
  { href: "/schools",     label: "Schools" },
  { href: "/parents",     label: "Families" },
  { href: "/methodology", label: "Methodology" },
  { href: "/blog",        label: "Resources" },
];

export default function Nav({ variant = "light" }: { variant?: NavVariant }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = variant === "dark";
  const isLightRed = variant === "light-red";
  const { openModal } = useModal();
  const pathname = usePathname();

  /** Match current route to highlight active nav link */
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close dropdown on route change
  useEffect(() => {
    setProgramsOpen(false);
    setMobileSubmenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setProgramsOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setProgramsOpen(false), 150);
  };

  return (
    <nav
      className={`w-full flex items-center justify-between py-5 ${
        isDark ? "text-white" : isLightRed ? "text-black" : "bg-white text-black"
      }`}
      style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
    >
      {/* Logo */}
      <Link href="/" className="shrink-0" aria-label="EKUZO home">
        <Image
          src={isDark ? "/images/ekuzo-logo.svg" : isLightRed ? "/images/ekuzo-logo-red.svg" : "/images/ekuzo-logo-black.svg"}
          alt="EKUZO"
          width={170}
          height={33}
          className="w-[110px] md:w-[170px] h-auto"
          priority
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden lg:flex items-center gap-10">
        <ul className="flex gap-10 text-base font-medium">
          {navLinks.map((l) =>
            l.hasSubmenu ? (
              <li
                key={l.href}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={l.href}
                  className={`relative transition-all pb-1 inline-flex items-center gap-1 hover:font-bold hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] ${
                    isDark ? "hover:after:bg-white" : "hover:after:bg-black"
                  } ${
                    isActive(l.href)
                      ? "font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] " +
                        (isDark ? "after:bg-white" : "after:bg-black")
                      : ""
                  }`}
                >
                  {l.label}
                  <span className="text-sm font-bold leading-none ml-0.5">
                    {programsOpen ? "−" : "+"}
                  </span>
                </Link>

                {/* Dropdown */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                    programsOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <div
                    className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                    style={{ minWidth: "280px" }}
                  >
                    {/* "All Programs" header link */}
                    <Link
                      href="/programs"
                      className="block px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red transition-colors border-b border-gray-100"
                    >
                      All Programs
                    </Link>
                    {programsSubmenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-5 py-4 transition-colors hover:bg-gray-50 group ${
                          isActive(item.href) ? "bg-gray-50" : ""
                        }`}
                      >
                        <span className="block font-bold text-black group-hover:text-red transition-colors">
                          {item.label}
                        </span>
                        <span className="block text-sm text-gray-500 mt-0.5">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ) : (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative transition-all pb-1 hover:font-bold hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] ${
                    isDark ? "hover:after:bg-white" : "hover:after:bg-black"
                  } ${
                    isActive(l.href)
                      ? "font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] " +
                        (isDark ? "after:bg-white" : "after:bg-black")
                      : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            )
          )}
        </ul>
        <Button
          variant={isDark ? "white-filled" : "red-filled"}
          onClick={() => openModal("enroll")}
        >
          Enroll my gamer
        </Button>
      </div>

      {/* Mobile hamburger — animates to X when open */}
      <button
        className="lg:hidden p-2 relative w-10 h-10 flex flex-col items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        <span
          className={`block w-6 h-0.5 transition-all duration-300 absolute ${
            isDark ? "bg-white" : "bg-black"
          } ${mobileOpen ? "rotate-45 top-[19px]" : "top-[12px]"}`}
        />
        <span
          className={`block w-6 h-0.5 transition-all duration-300 absolute top-[19px] ${
            isDark ? "bg-white" : "bg-black"
          } ${mobileOpen ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`block w-6 h-0.5 transition-all duration-300 absolute ${
            isDark ? "bg-white" : "bg-black"
          } ${mobileOpen ? "-rotate-45 top-[19px]" : "top-[26px]"}`}
        />
      </button>

      {/* Mobile drawer — portaled to body so it escapes all stacking contexts */}
      {mobileOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col">
          {/* Nav bar area — matches page nav height, blocks scroll-through */}
          <div className="shrink-0 bg-red flex items-center justify-between py-5" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
            <Link href="/" className="shrink-0" aria-label="EKUZO home" onClick={() => setMobileOpen(false)}>
              <Image
                src={isDark ? "/images/ekuzo-logo.svg" : isLightRed ? "/images/ekuzo-logo-red.svg" : "/images/ekuzo-logo-black.svg"}
                alt="EKUZO"
                width={170}
                height={33}
                className="w-[110px] md:w-[170px] h-auto"
              />
            </Link>
            <button
              className="p-2 relative w-10 h-10 flex flex-col items-center justify-center"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <span className="block w-6 h-0.5 bg-white absolute rotate-45 top-[19px]" />
              <span className="block w-6 h-0.5 bg-white absolute -rotate-45 top-[19px]" />
            </button>
          </div>
          {/* Drawer content */}
          <div className="flex-1 bg-white text-black px-6 py-8 flex flex-col gap-6 overflow-y-auto">
            <ul className="flex flex-col gap-6 text-lg font-medium">
              {navLinks.map((l) =>
                l.hasSubmenu ? (
                  <li key={l.href}>
                    <button
                      className={`flex items-center gap-2 transition-colors w-full text-left ${
                        isActive(l.href) ? "text-red" : "hover:text-red"
                      }`}
                      onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                    >
                      {l.label}
                      <span className="text-base font-bold leading-none">
                        {mobileSubmenuOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        mobileSubmenuOpen ? "max-h-[300px] mt-3" : "max-h-0"
                      }`}
                    >
                      <div className="flex flex-col gap-1 pl-4 border-l-2 border-red">
                        <Link
                          href="/programs"
                          className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-red transition-colors py-1"
                          onClick={() => setMobileOpen(false)}
                        >
                          All Programs
                        </Link>
                        {programsSubmenu.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`py-2 transition-colors ${
                              isActive(item.href) ? "text-red" : "hover:text-red"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="block font-semibold text-base">{item.label}</span>
                            <span className="block text-sm text-gray-500">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`transition-colors ${
                        isActive(l.href) ? "text-red" : "hover:text-red"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
            <div className="flex flex-col gap-3 pt-4 border-t border-grey">
              <Button variant="red-outlined" onClick={() => { setMobileOpen(false); openModal("enroll"); }}>
                Enroll my gamer
              </Button>
              <Button variant="red-filled" onClick={() => { setMobileOpen(false); openModal("contact"); }}>
                Talk to Humans
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
