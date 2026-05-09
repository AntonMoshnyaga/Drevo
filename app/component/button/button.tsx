import Link from "next/link";
import React from "react";
import styles from "./style.module.css";

interface ButtonProps {
  children: React.ReactNode;
  // 1. Робимо href необов'язковим
  href?: string; 
  // 2. Додаємо підтримку onClick та інших стандартних атрибутів кнопки
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

  // 3. Логіка вибору тега: якщо є href — використовуємо Link, інакше — <button>
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