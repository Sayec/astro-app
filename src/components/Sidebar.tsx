'use client';

import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        
        if (window.innerWidth <= 1024) {
            setIsOpen(false);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (isOpen) {
            document.body.classList.remove('sidebar-closed');
        } else {
            document.body.classList.add('sidebar-closed');
        }
    }, [isOpen, mounted]);

    const actualIsOpen = mounted ? isOpen : true;
    const actualIsMobile = mounted ? isMobile : false;

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (isMobile) setIsOpen(false);
    };

    const menuItems = [
        { id: 'weather', label: 'Pogoda', icon: '🌤️' },
        { id: 'tonight', label: 'Dzisiejszej Nocy', icon: '🌙' },
        { id: 'skymap', label: 'Mapa Nieba', icon: '🗺️' },
        { id: 'framecalc', label: 'Kalkulator Klatek', icon: '📸' },
        { id: 'topobjects', label: 'Top Obiekty', icon: '✨' },
        { id: 'apod', label: 'APOD', icon: '🖼️' },
        { id: 'satellites', label: 'Satelity', icon: '🛰️' },
        { id: 'search', label: 'Szukaj', icon: '🔍' },
        { id: 'equipment', label: 'Sprzęt', icon: '🔭' },
        { id: 'gallery', label: 'Galeria', icon: '🌌' },
    ];

    return (
        <>
            {/* Hamburger button for mobile */}
            <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
                <span className={`hamburger-line ${actualIsOpen && actualIsMobile ? 'active-1' : ''}`}></span>
                <span className={`hamburger-line ${actualIsOpen && actualIsMobile ? 'active-2' : ''}`}></span>
                <span className={`hamburger-line ${actualIsOpen && actualIsMobile ? 'active-3' : ''}`}></span>
            </button>

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${actualIsOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            ></div>

            {/* Sidebar content */}
            <nav className={`app-sidebar ${actualIsOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <a href="#" onClick={scrollToTop} className="sidebar-logo">
                        <img src="/logo.png" alt="AstroView" />
                        <span>AstroView</span>
                    </a>
                </div>

                <div className="sidebar-menu">
                    <div className="menu-title">DASHBOARD</div>
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <a href={`#${item.id}`} onClick={closeSidebar}>
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-label">{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <span>AstroView © {new Date().getFullYear()}</span>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
