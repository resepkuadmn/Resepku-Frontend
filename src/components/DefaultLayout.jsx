import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); 
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // --- ANIMATION STATE ---
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState([]); 
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const location = useLocation(); 
  const navigate = useNavigate();

    // Ref to detect unmount and avoid setting state after unmount
    const isUnmountedRef = useRef(false);

    // Animasi Masuk
    useEffect(() => {
        setMounted(true);
        if (!token) return;
        axiosClient.post('/visit').catch(() => {});

        // cleanup: mark unmounted so async callbacks won't set state
        return () => {
            isUnmountedRef.current = true;
        };
    }, [location.pathname, token]);

    // Reset the `isAnimating` flag when the route actually changes.
    // Without this, `isAnimating` can remain `true` after a navigate which
    // keeps the layout scaled/faded out (header/footer invisible) until
    // a full reload. Resetting here allows the fade-out -> navigate -> fade-in
    // sequence to complete correctly.
    useEffect(() => {
        // When the pathname changes the navigation completed — clear the flag
        // so the layout can fade back in.
        setIsAnimating(false);
    }, [location.pathname]);

  // --- FETCH DATA ---
  useEffect(() => {
    if (token) {
        axiosClient.get('/user')
            .then(({ data }) => setUser(data))
            .catch(() => setToken(null));
        getNotifications();
    }
  }, []);

    // Poll for notifications periodically (every 20s) so web users receive near-real-time updates
    useEffect(() => {
        if (!token) return;
        const iv = setInterval(() => {
            getNotifications();
        }, 20000);
        return () => clearInterval(iv);
    }, [token]);

  const getNotifications = () => {
      axiosClient.get('/notifications')
        .then(({ data }) => setNotifications(data.data))
        .catch(() => setNotifications([]));
  }

  const onMarkRead = (e) => {
    e.preventDefault();
    if (unreadCount > 0) {
        axiosClient.post('/notifications/read')
        .then(() => {
            const updatedNotifs = notifications.map(n => ({...n, status: 'read'}));
            setNotifications(updatedNotifs);
        });
    }
  }

  // --- FUNGSI NAVIGASI ANIMASI ---
  const handleNavigation = (path, ev) => {
    ev?.preventDefault();
    setIsMobileMenuOpen(false);
        // clear any scroll-driven override immediately — user explicitly clicked a
        // navigation button so the navbar should reflect the navigation action
        // not the scroll position.
        setScrolledActivePath(null);

    if (location.pathname === path) return;

    setIsAnimating(true);
    setTimeout(() => navigate(path), 500);
  };

  const onLogout = (ev) => {
    ev?.preventDefault();
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = (ev) => {
      ev?.preventDefault();
      setShowLogoutConfirm(false);
      
      // Tampilkan overlay spinner saat proses logout, tapi jangan memicu
      // animasi navigasi/exit untuk layout — kita ingin NO animation saat
      // proses keluar berlangsung (login page akan menampilkan animasinya
      // saat dipanggil).
      setIsLoggingOut(true);

      // Lakukan request logout segera (tanpa setTimeout) agar UI tidak menunggu
      axiosClient.post('/logout')
            .then(() => {
                setUser({});
                setToken(null);
                navigate('/login');
            })
            .catch((err) => {
                console.error('Logout failed:', err);
                setUser({});
                setToken(null);
                navigate('/login');
            })
            .finally(() => {
                if (!isUnmountedRef.current) setIsLoggingOut(false);
            });
  };

  const userMenus = [
    { name: 'HOME', path: '/dashboard' },
    { name: 'MENU', path: '/menu' },
    { name: 'ABOUT', path: '/about' },
    { name: 'TIPS', path: '/tips' },
    { name: 'REQUEST RESEP', path: '/request' },
  ];

  const adminMenus = [
    { name: 'HOME', path: '/dashboard' },
    { name: 'DASHBOARD', path: '/admin-stats' },
    { name: 'REQUEST', path: '/admin/request' },
    { name: 'LIST RESEP', path: '/admin/resep' },
    { name: '+ RESEP', path: '/admin/resep/create' },
    { name: 'LIST TIPS', path: '/admin/tips' },
    { name: '+ TIPS', path: '/admin/tips/create' },
    { name: 'LIST ABOUT', path: '/admin/about' },
    { name: '+ ABOUT', path: '/admin/about/create' },
  ];

  const menus = user.role === 'admin' ? adminMenus : userMenus;

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Class animasi
  const animationClass = isAnimating || !mounted
    ? 'scale-95 opacity-0' 
    : 'scale-100 opacity-100';

    // Map section ids (from Dashboard's sections) to menu paths so the
    // navbar can highlight the correct menu item when the user scrolls
    // inside the /dashboard page.
    const sectionIdToPath = {
        // admin sections
        'admin-stats': '/admin-stats',
        'list-resep': '/admin/resep',
        'create-resep': '/admin/resep/create',
        'list-tips': '/admin/tips',
        'create-tips': '/admin/tips/create',
        'list-about': '/admin/about',
        'create-about': '/admin/about/create',
        'admin-requests': '/admin/request',
        // guest/user sections
        'about-team': '/about',
        'about-stories': '/about',
        'menu': '/menu',
        'tips': '/tips',
        'request-resep': '/request',
        'kontak': '/kontak',
    };

    // When on /dashboard we accept scroll-driven section change events
    // (dispatched by SectionDots) and use them to temporarily override
    // the active menu item displayed in the navbar.
    const [scrolledActivePath, setScrolledActivePath] = useState(null);

    useEffect(() => {
        const onSectionChange = (ev) => {
            const id = ev?.detail?.id || '';
            if (location.pathname === '/dashboard') {
                const mapped = sectionIdToPath[id] || '/dashboard';
                setScrolledActivePath(mapped);
            } else {
                setScrolledActivePath(null);
            }
        };

        window.addEventListener('section-change', onSectionChange);
        return () => window.removeEventListener('section-change', onSectionChange);
    }, [location.pathname]);

    return (
        <div 
            id="defaultLayout" 
            // Match the app default background to avoid bright white seams for logged-in pages
            className="min-h-screen flex flex-col bg-[#f4f4f4] font-montserrat"
        >
            {/* Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white px-6 py-4 rounded-md shadow-lg flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-t-2 border-gray-300 rounded-full animate-spin"></div>
                        <div className="text-sm font-medium">Sedang keluar... Mohon tunggu</div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal (render via portal so it shows independent of scroll context) */}
            {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="hidden lg:block fixed top-20 right-6 z-50 animate-fade-in-up">
                        <div className="w-52 bg-white rounded-lg shadow-xl border border-gray-200 px-6 py-4 text-center relative">
                            <div className="absolute -top-3 right-6 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200" />
                            <h3 className="text-sm font-serif font-semibold text-[#333] mb-2">Keluar dari resepku?</h3>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleConfirmLogout} className="text-red-500 font-bold hover:bg-red-50 rounded py-1 transition">Keluar</button>
                                <button onClick={() => setShowLogoutConfirm(false)} className="text-gray-600 hover:bg-gray-100 rounded py-1 transition">Batal</button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center max-w-xs w-full mx-4">
                            <h3 className="text-lg font-serif font-semibold text-[#333] mb-3">Keluar dari resepku?</h3>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleConfirmLogout} className="text-red-500 font-bold text-xl hover:bg-red-50 rounded py-2 transition">Keluar</button>
                                <button onClick={() => setShowLogoutConfirm(false)} className="text-gray-600 hover:bg-gray-100 rounded py-2 transition">Batal</button>
                            </div>
                        </div>
                    </div>
                </>, document.body
            )}
      
      {/* NAVBAR */}
      <nav className="bg-[#e6a357] shadow-md sticky top-0 z-50 flex-shrink-0 w-full px-10">
        <div className="relative flex items-center h-20 w-full">
          
          {/* LOGO */}
          <div className="absolute left-0 flex items-center z-20">
              <a 
                href="/dashboard"
                onClick={(ev) => handleNavigation('/dashboard', ev)} 
                className="text-3xl font-bold text-[#333] flex items-center cursor-pointer" 
                style={{ fontFamily: '"Lucida Handwriting", cursive' }}
              >
                RESEP<span className="text-[#e74c3c]">KU</span>
              </a>
          </div>

          {/* MENU TENGAH */}
          <div className="hidden lg:flex w-full justify-center absolute left-0 right-0 z-10 pointer-events-none">
              <div className="pointer-events-auto flex space-x-8">
                {menus.map((menu) => (
                    <a 
                        key={menu.name} 
                        href={menu.path}
                        onClick={(ev) => handleNavigation(menu.path, ev)}
                        className={`font-bold text-[14px] transition duration-300 uppercase tracking-wide whitespace-nowrap cursor-pointer
                            ${scrolledActivePath ? (scrolledActivePath === menu.path ? 'text-white underline underline-offset-8 decoration-2' : 'text-[#333] hover:text-white') : (location.pathname === menu.path ? 'text-white underline underline-offset-8 decoration-2' : 'text-[#333] hover:text-white')}
                        `}
                    >
                        {menu.name}
                    </a>
                ))}
              </div>
          </div>

          {/* TOMBOL KANAN */}
          <div className="absolute right-0 hidden lg:flex items-center gap-6 z-20">
              
              {/* NOTIFIKASI */}
              {user.role !== 'admin' && (
                  <div className="relative">
                      <button 
                          onClick={() => setIsNotifOpen(!isNotifOpen)}
                          className="text-[#333] text-xl hover:text-white transition relative focus:outline-none mt-1"
                      >
                          <i className="fas fa-bell"></i>
                          {unreadCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-[#e74c3c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#e6a357]">
                                  {unreadCount}
                              </span>
                          )}
                      </button>

                      {isNotifOpen && (
                          <div className="absolute right-0 mt-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in-up">
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                  <span className="font-bold text-gray-700 text-sm">Notifikasi</span>
                                  <button onClick={onMarkRead} className="text-xs text-[#e6a357] hover:underline font-bold">
                                    Tandai dibaca
                                  </button>
                              </div>
                              <ul className="max-h-64 overflow-y-auto text-left">
                                  {notifications.length > 0 ? (
                                      notifications.map((notif) => (
                                          <li key={notif.id} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${notif.status === 'unread' ? 'bg-orange-50/50 border-l-4 border-l-[#e6a357]' : ''}`}>
                                              <p className="text-sm text-gray-600">{notif.pesan}</p>
                                              <span className="text-xs text-gray-400 mt-1 block">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                              </span>
                                          </li>
                                      ))
                                  ) : (
                                      <li className="px-4 py-6 text-center text-gray-400 text-sm italic">Tidak ada notifikasi baru</li>
                                  )}
                              </ul>
                          </div>
                      )}
                  </div>
              )}

              {/* Logout Button */}
              <button onClick={onLogout} className="bg-[#333] text-white font-bold px-6 py-2 rounded hover:bg-black transition shadow-md text-sm tracking-wider uppercase">
                  LOGOUT
              </button>
          </div>
          
          {/* Hamburger */}
          <div className="absolute right-0 lg:hidden flex items-center z-20">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#333] text-3xl focus:outline-none">
                  <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden bg-[#e6a357] border-t border-[#333]/20 overflow-hidden transition-all duration-300 absolute top-20 left-0 w-full ${isMobileMenuOpen ? 'max-h-screen py-4 shadow-lg' : 'max-h-0'}`}>
             <div className="flex flex-col px-4 space-y-3">
                {menus.map((menu) => (
                    <a 
                        key={menu.name} 
                        href={menu.path}
                        onClick={(ev) => handleNavigation(menu.path, ev)} 
                        className={`text-[#333] font-bold block pb-2 border-b border-black/10 hover:text-white cursor-pointer
                          ${scrolledActivePath ? (scrolledActivePath === menu.path ? 'text-white bg-[#333]/10' : '') : (location.pathname === menu.path ? 'text-white bg-[#333]/10' : '')}
                        `}
                    >
                        {menu.name}
                    </a>
                ))}
                <button onClick={onLogout} className="bg-[#333] text-white font-bold py-2 rounded text-center mt-2 w-full hover:bg-black">
                    LOGOUT
                </button>
            </div>
        </div>
      </nav>

    {/* Main content with animation - only this part animates, header/footer stay static */}
    <main className={`flex-grow w-full relative bg-[#f4f4f4] transform transition-all duration-500 ease-in-out ${animationClass}`}><Outlet /></main>
      
      <footer className="bg-[#e6a357] text-[#333] py-10 px-10 mt-auto border-t-4 border-[#007bff] relative z-20">
           <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-[#333] pb-8 mb-6 max-w-7xl mx-auto"> 
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/dashboard" onClick={(ev) => handleNavigation('/dashboard', ev)} className="hover:underline cursor-pointer">Home</a></li>
                        <li><a href="/menu" onClick={(ev) => handleNavigation('/menu', ev)} className="hover:underline cursor-pointer">Resep</a></li>
                        <li><a href="/about" onClick={(ev) => handleNavigation('/about', ev)} className="hover:underline cursor-pointer">About</a></li>
                    </ul>
                </div>
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/tips" onClick={(ev) => handleNavigation('/tips', ev)} className="hover:underline cursor-pointer">Tips</a></li>
                        <li><a href="/request" onClick={(ev) => handleNavigation('/request', ev)} className="hover:underline cursor-pointer">Request Resep</a></li>
                    </ul>
                </div>
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/about-us" onClick={(ev) => handleNavigation('/about-us', ev)} className="hover:underline cursor-pointer">Tentang Kami</a></li>
                        <li><a href="/kontak" onClick={(ev) => handleNavigation('/kontak', ev)} className="hover:underline cursor-pointer">Hubungi Kami</a></li>
                    </ul>
                </div>
                <div className="min-w-[150px]">
                    <h4 className="font-bold text-lg mb-4 text-[#333]">Ikuti Kami</h4>
                    <div className="flex space-x-5 text-2xl">
                        <a href="#" className="text-[#C13584] hover:opacity-80 transition"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="text-[#FF0000] hover:opacity-80 transition"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="text-[#1877F2] hover:opacity-80 transition"><i className="fab fa-facebook"></i></a>
                    </div>
                </div>
            </div>
            <div className="text-center font-medium text-[#333]">Hak Cipta &copy; 2025 Resepku</div>
        </div>
      </footer>
    </div>
  );
}