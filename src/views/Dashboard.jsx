import { useStateContext } from "../contexts/ContextProvider";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// For logged-in dashboard we show team info for users and admin list sections for admins
import ListResep from './admin/ListResep';
import ListTips from './admin/ListTips';
import ListAbout from './admin/ListAbout';
import MenuGuest from './guest/MenuGuest';
import TipsGuest from './guest/TipsGuest';
import ResepForm from './admin/ResepForm';
import TipsForm from './admin/TipsForm';
import AboutForm from './admin/AboutForm';
import RequestResepGuest from './guest/RequestResepGuest';
import AboutStories from './guest/AboutStories';
import DashboardStats from './admin/DashboardStats';
import RequestResepAdmin from './admin/RequestResep';
// AboutTeam and KontakGuest intentionally removed from the dashboard scroll container
import { useRef } from 'react';
import useSectionSnap from '../hooks/useSectionSnap';
import SectionDots from '../components/SectionDots';
// (imports above already included admin list modules)

function SearchBox() {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (ev) => {
    if (ev.key === 'Enter') {
      navigate(`/menu?q=${encodeURIComponent(keyword)}`);
    }
  }

  return (
    <>
      <input
        type="text"
        placeholder="Cari resep favoritmu disini"
        className="w-full py-4 pl-14 pr-6 rounded-full shadow-2xl border-none outline-none text-gray-600 text-lg font-medium focus:ring-4 focus:ring-resepku-orange/50 transition"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleSearch}
      />
      <i className="fas fa-search absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
    </>
  );
}

export default function Dashboard() {
  const { user } = useStateContext();
  const scrollRef = useRef(null);
  useSectionSnap(scrollRef);

  return (
    <div className="relative w-full flex-grow min-h-[calc(100vh-160px)]">
      
      {/* Scrollable section container (snapping for logged-in home) */}
      {/* reserve space for header (80px) and footer (80px), and pad sections so header/footer stay visible */}
      <div
        ref={scrollRef}
        // keep container background same as the page so empty areas don't appear white
        className="w-full max-w-full mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#f4f4f4]"
        style={{ height: 'calc(100vh - var(--header-h,80px) - var(--footer-h,80px))' }}
      >
        <SectionDots containerRef={scrollRef} />
        <section id="hero" className="snap-start h-[calc(100vh-160px)] relative overflow-hidden pt-20 pb-20">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/gambar/login.jpg')" }} />
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        
        {/* --- LOGIKA ADMIN VS USER --- */}
        {/* Saya selipkan kembali agar Admin tetap melihat Welcome */}
        {/* show search for everyone (admin + member) — behaviour should be same as HomeGuest */}
        <div className="w-full max-w-2xl mb-8 relative animate-fade-in-up">
          <SearchBox />
        </div>

        {user.role === 'admin' ? (
          <div className="bg-white px-10 py-3 rounded-full shadow-lg mb-8 animate-fade-in-up">
            <span className="text-xl font-bold text-resepku-brown tracking-[0.1em] uppercase font-montserrat">
              WELCOME ADMIN
            </span>
          </div>
        ) : null}

        {/* note: hero only shows the search and heading; per-role content appears after the hero */}

        {/* TEKS BESAR (Sesuai kode Anda: Menggunakan text-resepku-red) */}
        <h1 className="text-4xl md:text-6xl font-black text-resepku-dark leading-tight drop-shadow-md animate-fade-in-up delay-100 font-montserrat">
          DAPATKAN INSPIRASI<br />
          <span className="text-resepku-red relative inline-block px-2">
            RESEP HARIAN YANG
          </span><br />
          LEZAT DAN MUDAH
        </h1>

        </div>
      </section>
        {/* Show different sections depending on role: admin gets List pages, regular users see team/menu/tips */}
        {user.role === 'admin' ? (
          <>
            <section id="admin-stats" data-title="Grafik" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <DashboardStats />
            </section>

            <section id="list-resep" data-title="Daftar Resep" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <ListResep />
            </section>

            <section id="create-resep" data-title="Tambah Resep" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <ResepForm />
            </section>

            <section id="list-tips" data-title="Daftar Tips" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <ListTips />
            </section>

            <section id="create-tips" data-title="Tambah Tips" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <TipsForm />
            </section>

            <section id="list-about" data-title="Daftar About" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <ListAbout />
            </section>

            <section id="create-about" data-title="Tambah About" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <AboutForm />
            </section>
            
            <section id="admin-requests" data-title="Request" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <RequestResepAdmin />
            </section>
          </>
        ) : (
          <>
            {/* AboutTeam removed from logged-in user home scroll container per request */}

            <section id="about-stories" data-title="Cerita" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <AboutStories />
            </section>

            <section id="menu" data-title="Menu" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <MenuGuest />
            </section>

            <section id="tips" data-title="Tips" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <TipsGuest />
            </section>

            <section id="request-resep" data-title="Request Resep" className="snap-start h-[calc(100vh-160px)] overflow-y-auto pt-20 pb-20">
              <RequestResepGuest />
            </section>
          </>
        )}
        

        {/* Kontak removed from logged-in dashboard scroll container per request. */}
      </div>
    </div>
    
  );
}