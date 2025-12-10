import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom"; // Import Link
import axiosClient from "../../axios-client";

export default function MenuGuest() {
  const [reseps, setReseps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || ''; 

    const IMAGE_BASE_URL = "/gambar/";

  useEffect(() => {
    axiosClient.get('/resep')
      .then(({ data }) => {
        // Sort by kategori: makanan, minuman, dessert
        const sorted = (data.data || []).sort((a, b) => {
          const categoryOrder = { makanan: 0, minuman: 1, dessert: 2 };
          const aOrder = categoryOrder[a.jenis?.toLowerCase()] ?? 999;
          const bOrder = categoryOrder[b.jenis?.toLowerCase()] ?? 999;
          return aOrder - bOrder;
        });
        setReseps(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReseps = reseps.filter(resep => {
    const matchCategory = filter === 'semua' || resep.jenis.toLowerCase() === filter;
    const matchSearch = resep.judul.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

    return (
        // Removed min-h-screen here. sections are already sized by the parent
        // container (Dashboard) via h-[calc(100vh-160px)] so the child shouldn't
        // force a full viewport height which can cause gaps/white space.
        <div className="max-w-7xl mx-auto px-6 py-12 font-montserrat">
      
      {/* 1. NAVIGASI KATEGORI (HANYA TAMPIL JIKA TIDAK SEDANG MENCARI) */}
      {!searchQuery && (
        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up">
            <button onClick={() => setFilter('makanan')} className={`w-48 h-24 rounded-xl flex flex-col items-center justify-center shadow-md transition-transform hover:-translate-y-1 ${filter === 'makanan' ? 'bg-[#d58f3c] scale-105' : 'bg-[#e6a357]'}`}>
                <i className="fas fa-utensils text-3xl text-[#333] mb-2"></i>
                <span className="font-black text-[#333] uppercase tracking-wider">MAKANAN</span>
            </button>
            <button onClick={() => setFilter('minuman')} className={`w-48 h-24 rounded-xl flex flex-col items-center justify-center shadow-md transition-transform hover:-translate-y-1 ${filter === 'minuman' ? 'bg-[#d58f3c] scale-105' : 'bg-[#e6a357]'}`}>
                <i className="fas fa-mug-hot text-3xl text-[#333] mb-2"></i>
                <span className="font-black text-[#333] uppercase tracking-wider">MINUMAN</span>
            </button>
            <button onClick={() => setFilter('dessert')} className={`w-48 h-24 rounded-xl flex flex-col items-center justify-center shadow-md transition-transform hover:-translate-y-1 ${filter === 'dessert' ? 'bg-[#d58f3c] scale-105' : 'bg-[#e6a357]'}`}>
                <i className="fas fa-cake-candles text-3xl text-[#333] mb-2"></i>
                <span className="font-black text-[#333] uppercase tracking-wider">DESSERT</span>
            </button>
            <button onClick={() => setFilter('semua')} className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center border-2 border-[#e6a357] shadow-sm hover:bg-orange-50 transition ${filter === 'semua' ? 'bg-orange-100' : 'bg-white'}`}>
                <span className="font-bold text-[#e6a357] text-xs">LIHAT</span>
                <span className="font-black text-[#e6a357] uppercase tracking-wider">SEMUA</span>
            </button>
        </div>
      )}

      {/* 2. JUDUL */}
      <div className="mb-8 flex justify-between items-end border-b-2 border-[#e6a357]/20 pb-2">
          <h2 className="text-3xl font-black text-[#333]">
             {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Pencarian Populer'}
          </h2>
          {searchQuery && (
              <Link to="/menu" className="text-sm text-gray-500 hover:text-[#e6a357]">Hapus Pencarian</Link>
          )}
      </div>

      {/* 3. GRID RESEP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
            <p className="col-span-full text-center text-gray-500 py-10">Memuat resep...</p>
        ) : filteredReseps.length === 0 ? (
            <div className="col-span-full text-center py-20">
                <i className="fas fa-search text-6xl text-gray-200 mb-4"></i>
                <p className="text-gray-500 font-medium text-xl">Maaf, tidak ditemukan resep "{searchQuery}"</p>
                <Link to="/menu" className="mt-4 inline-block text-[#e6a357] font-bold underline">Lihat semua menu</Link>
            </div>
        ) : (
            filteredReseps.map((resep) => (
                // --- DISINI KITA BUNGKUS DENGAN LINK AGAR BISA DIKLIK ---
                <Link 
                    to={`/resep/${resep.id}`} 
                    key={resep.id} 
                    className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden hover:-translate-y-2 transition duration-300 border border-gray-100 block"
                >
                    <div className="relative h-56 overflow-hidden">
                        <img 
                            src={`${IMAGE_BASE_URL}${resep.gambar}`} 
                            alt={resep.judul} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
                        />
                         {/* Badge Kategori (Opsional) */}
                         <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#333] text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm">
                            {resep.jenis}
                        </span>
                    </div>

                    <div className="p-6 relative">
                        <h3 className="text-xl font-bold text-[#333] mb-3 font-serif line-clamp-1">
                            {resep.judul}
                        </h3>
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <i className="far fa-clock text-[#777]"></i>
                                <span>{resep.waktu}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-user-friends text-[#777]"></i>
                                <span>{resep.porsi}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}