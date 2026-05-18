import Link from "next/link";
import React from "react";
import styles from "./style.module.css";

interface ButtonProps {
  children: React.ReactNode;
  href?: string; 
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({ 
  children, 
  href, 
  onClick, 
  variant = "primary", 
  className,
  type = "button" 
}: ButtonProps) {

  const variantClass = variant === "primary" ? styles.primary : styles.outline;
  const combinedClassName = `${styles.button} ${variantClass} ${className || ""}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      className={combinedClassName} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}