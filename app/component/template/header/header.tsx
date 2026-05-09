'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import style from "./style.module.css";
import Button from "../../button/button";
import { useAuth } from '../../../../lib/context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        router.push('/'); 
    };

    const logoHref = user ? "/pages/main" : "/";

    return (
        <header className={style.header}>
            <div className={style.header_container}>
                <Link href={logoHref} className="flex items-center">
                    <Image 
                        src="/DrevoLogo.svg" 
                        alt="Drevo" 
                        width={80} 
                        height={80} 
                        priority 
                    />
                </Link>

                <nav className={style.nav_links}>
                    {user ? (
                        <div className={style.dropdown_container} ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={style.user_menu_btn}
                            >
                                
                                <span className={style.user_name}>{user.name}</span>
                                <span className={style.arrow}>{isDropdownOpen ? '▴' : '▾'}</span>

                                
                                <div className={style.avatar_wrapper}>
                                    {user.photo_url ? (
                                        <img 
                                            src={user.photo_url} 
                                            alt={user.name} 
                                            className={style.user_avatar} 
                                        />
                                    ) : (
                                        <div className={style.avatar_fallback}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className={style.dropdown_menu}>
                                    <Link 
                                        href="/pages/profile" 
                                        className={style.dropdown_item}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Профіль
                                    </Link>
                                    <button 
                                        onClick={handleLogout} 
                                        className={`${style.dropdown_item} ${style.logout_btn}`}
                                    >
                                        Вийти
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button href="/pages/registr" variant="primary">Розпочати</Button>
                            <Button href="/pages/auth" variant="primary">Увійти</Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}