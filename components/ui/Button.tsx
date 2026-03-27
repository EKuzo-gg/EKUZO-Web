import Link from "next/link";

type ButtonVariant =
  | "red-filled"
  | "red-outlined"
  | "white-filled"
  | "white-outlined";

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
};

const variantClasses: Record<ButtonVariant, string> = {
  "red-filled":    "bg-red text-white border-2 border-red hover:opacity-90",
  "red-outlined":  "bg-transparent text-red border-2 border-red hover:bg-red hover:text-white",
  "white-filled":  "bg-white text-black border-2 border-white hover:opacity-90",
  "white-outlined":"bg-transparent text-white border-2 border-white hover:bg-white hover:text-black",
};

export default function Button({
  variant = "red-filled",
  href,
  onClick,
  children,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-5 py-4 rounded-sm text-base font-bold font-body transition-all duration-150 whitespace-nowrap cursor-pointer";
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
