import { useState } from "react";
import MenuGuest from "./guest/MenuGuest";
import TipsGuest from "./guest/TipsGuest";
import { useNavigate } from "react-router-dom";
import { useRef } from 'react';
import useSectionSnap from '../hooks/useSectionSnap';
import SectionDots from '../components/SectionDots';

export default function HomeGuest() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const scrollRef = useRef(null);
  useSectionSnap(scrollRef);

  // Fungsi saat tombol Enter ditekan
  const handleSearch = (ev) => {
    if (ev.key === 'Enter') {
      // Pindah ke halaman /menu dengan membawa kata kunci di URL
      // Contoh URL: /menu?q=Nasi Goreng
      navigate(`/menu?q=${keyword}`);
    }
  }

  return (
    // Main container: hero + scrollable sections below (snap to sections)
    // Use flex-grow so the parent layout controls vertical space — avoid forcing
    // a custom min-height here which can create gaps when header/footer sizing
    // or viewport changes.
    <div className="relative w-full flex-grow">
      
      {/* top hero is a section inside the scroll container below */}

      {/* Scrollable section container (snap scrolling) */}
      {/* keep header (80px) and footer (80px) visible; use padding so content isn't hidden behind them */}
      <div
        ref={scrollRef}
        // ensure scroll viewport uses app background to avoid visible white band above footer
        className="w-full max-w-full mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#f4f4f4]"
        style={{ height: 'calc(100vh - var(--header-h,80px) - var(--footer-h,80px))' }}
      >
        <SectionDots containerRef={scrollRef} />
        <section id="hero" className="snap-start h-[calc(100vh-160px)] relative overflow-hidden pt-20 pb-20">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/gambar/login.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <div className="w-full max-w-2xl mb-8 relative animate-fade-in-up">
              <input 
                type="text"
                placeholder="Cari resep favoritmu disini..."
                className="w-full py-4 pl-14 pr-6 rounded-full shadow-2xl border-none outline-none text-gray-600 text-lg font-medium focus:ring-4 focus:ring-[#e6a357]/50 transition"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleSearch}
              />
              <i className="fas fa-search absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none"></i>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-black leading-tight drop-shadow-sm animate-fade-in-up delay-100 font-montserrat">
              DAPATKAN INSPIRASI<br />
              <span className="text-[#e74c3c] relative inline-block px-2">RESEP HARIAN YANG</span><br />
              LEZAT DAN MUDAH
            </h1>
          </div>
        </section>

        {/* AboutTeam removed from the scroll container as requested. The site
            footer still contains contact/about links — we keep that unchanged. */}

        <section id="menu" data-title="Menu" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
          <MenuGuest />
        </section>

        <section id="tips" data-title="Tips" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
          <TipsGuest />
        </section>

        {/* Kontak removed from the scroll container per request (still present in footer). */}
      </div>
    </div>
  );
}