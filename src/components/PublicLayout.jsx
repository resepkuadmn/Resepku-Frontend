import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

export default function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- ANIMATION STATE ---
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kirim sinyal visit
    axiosClient.post('/visit').catch(() => {});
  }, [location.pathname]);

    // Map guest section ids -> routes so the navbar can highlight while
    // the user scrolls on the public homepage (HomeGuest).
    const sectionIdToPath = {
        hero: '/',
        'about-team': '/',
        menu: '/menu',
        tips: '/tips',
        kontak: '/kontak',
    };

    const [scrolledActivePath, setScrolledActivePath] = useState(null);

    useEffect(() => {
        const onSectionChange = (ev) => {
            const id = ev && ev.detail && ev.detail.id ? ev.detail.id : '';
            if (location.pathname === '/') {
                const mapped = sectionIdToPath[id] || '/';
                setScrolledActivePath(mapped);
            } else {
                setScrolledActivePath(null);
            }
        };

        window.addEventListener('section-change', onSectionChange);
        return () => window.removeEventListener('section-change', onSectionChange);
    }, [location.pathname]);

    // Reset the `isAnimating` flag after the route changes so that
    // the layout fades back in (prevents header/footer staying hidden
    // when navigating without a full reload).
    useEffect(() => {
        setIsAnimating(false);
    }, [location.pathname]);

  // --- FUNGSI NAVIGASI DENGAN ANIMASI ---
  const handleNavigation = (path, ev) => {
    ev?.preventDefault();
    setIsMobileMenuOpen(false); // Tutup menu mobile jika sedang terbuka
        // user clicked explicit navigation — clear the scroll-driven override
        setScrolledActivePath(null);
    
    // Jika sedang di halaman yang sama, tidak perlu animasi
    if (location.pathname === path) return;

    setIsAnimating(true);
    setTimeout(() => navigate(path), 500);
  };

  const guestMenus = [
    { name: 'HOME', path: '/' },
    { name: 'MENU', path: '/menu' },
    { name: 'TIPS', path: '/tips' },
  ];

  // Class animasi: Scale down & Fade out saat keluar/belum mount
  const animationClass = isAnimating || !mounted
    ? 'scale-95 opacity-0' 
    : 'scale-100 opacity-100';

  return (
    <div 
        className="min-h-screen flex flex-col font-montserrat bg-[#f4f4f4]"
    >
      
      {/* === NAVBAR === */}
      <nav className="bg-[#e6a357] shadow-md sticky top-0 z-50 flex-shrink-0 w-full px-10">
        <div className="relative flex items-center h-20 w-full">
          
          {/* 1. LOGO */}
          <div className="absolute left-0 flex items-center z-20">
              <a 
                href="/" 
                onClick={(ev) => handleNavigation('/', ev)}
                className="text-3xl font-bold text-[#333] flex items-center cursor-pointer" 
                style={{ fontFamily: '"Lucida Handwriting", cursive' }}
              >
                RESEP<span className="text-[#e74c3c]">KU</span>
              </a>
          </div>

          {/* 2. MENU TENGAH */}
          <div className="hidden lg:flex w-full justify-center absolute left-0 right-0 z-10 pointer-events-none">
              <div className="pointer-events-auto flex space-x-8">
                {guestMenus.map((menu) => (
                    <a 
                        key={menu.name} 
                        href={menu.path}
                        onClick={(ev) => handleNavigation(menu.path, ev)}
                                                className={`font-bold text-[14px] transition duration-300 uppercase tracking-wide cursor-pointer
                                                    ${scrolledActivePath ? (scrolledActivePath === menu.path ? 'text-white underline underline-offset-8 decoration-2' : 'text-[#333] hover:text-white') : (location.pathname === menu.path ? 'text-white underline underline-offset-8 decoration-2' : 'text-[#333] hover:text-white')}
                                                `}
                    >
                        {menu.name}
                    </a>
                ))}
              </div>
          </div>

          {/* 3. TOMBOL LOGIN */}
          <div className="absolute right-0 hidden lg:flex items-center z-20">
              <a 
                  href="/login"
                  onClick={(ev) => handleNavigation('/login', ev)}
                  className="bg-[#333] text-white font-bold px-8 py-2 rounded hover:bg-black transition shadow-md text-sm tracking-wider uppercase cursor-pointer"
              >
                  LOGIN
              </a>
          </div>

          {/* HAMBURGER (Mobile) */}
          <div className="absolute right-0 lg:hidden flex items-center z-20">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#333] text-3xl focus:outline-none">
                  <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`lg:hidden bg-[#e6a357] border-t border-[#333]/20 overflow-hidden transition-all duration-300 absolute top-20 left-0 w-full ${isMobileMenuOpen ? 'max-h-screen py-4 shadow-lg' : 'max-h-0'}`}>
            <div className="flex flex-col px-4 space-y-3">
                {guestMenus.map((menu) => (
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
                <a 
                    href="/login"
                    onClick={(ev) => handleNavigation('/login', ev)}
                    className="bg-[#333] text-white font-bold py-2 rounded text-center mt-2 w-full hover:bg-black cursor-pointer block"
                >
                    LOGIN
                </a>
            </div>
        </div>
      </nav>

      {/* === KONTEN UTAMA === */}
      {/* Main content with animation - only this part animates, header/footer stay static */}
      <main className={`flex-grow w-full relative flex flex-col transform transition-all duration-500 ease-in-out ${animationClass}`}>
         <Outlet />
      </main>

      {/* === FOOTER === */}
      <footer className="bg-[#e6a357] text-[#333] py-10 px-10 mt-auto border-t-4 border-[#007bff] relative z-20 flex-shrink-0">
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-[#333] pb-8 mb-6 max-w-7xl mx-auto">
                
                {/* Kolom 1 */}
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/" onClick={(ev) => handleNavigation('/', ev)} className="hover:underline cursor-pointer">Home</a></li>
                        <li><a href="/menu" onClick={(ev) => handleNavigation('/menu', ev)} className="hover:underline cursor-pointer">Resep</a></li>
                    </ul>
                </div>

                {/* Kolom 2 */}
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/tips" onClick={(ev) => handleNavigation('/tips', ev)} className="hover:underline cursor-pointer">Tips</a></li>
                    </ul>
                </div>

                {/* Kolom 3 */}
                <div className="min-w-[150px]">
                    <ul className="space-y-2 font-medium text-base">
                        <li><a href="/about-us" onClick={(ev) => handleNavigation('/about-us', ev)} className="hover:underline cursor-pointer">Tentang Kami</a></li>
                        <li><a href="/kontak" onClick={(ev) => handleNavigation('/kontak', ev)} className="hover:underline cursor-pointer">Hubungi Kami</a></li>
                    </ul>
                </div>

                {/* Kolom 4 */}
                <div className="min-w-[150px]">
                    <h4 className="font-bold text-lg mb-4 text-[#333]">Ikuti Kami</h4>
                    <div className="flex space-x-5 text-2xl">
                        <a href="#" className="text-[#C13584] hover:opacity-80 transition"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="text-[#FF0000] hover:opacity-80 transition"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="text-[#1877F2] hover:opacity-80 transition"><i className="fab fa-facebook"></i></a>
                    </div>
                </div>

            </div>
            <div className="text-center font-medium text-[#333]">
                Hak Cipta &copy; 2025 Resepku
            </div>
        </div>
      </footer>

    </div>
  );
}