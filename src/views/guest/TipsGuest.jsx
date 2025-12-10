import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";

export default function TipsGuest() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL Gambar Backend (Pastikan port 8000)
  const IMAGE_BASE_URL = "http://127.0.0.1:8000/gambar/";

  useEffect(() => {
    axiosClient.get('/tips')
      .then(({ data }) => {
        setTips(data.data); // Ambil array data dari response
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-montserrat animate-fade-in-up">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-[#333] mb-4 font-serif tracking-wide">
          TIPS DAPUR <span className="text-[#e6a357]">RESEPKU</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
            Kumpulan trik dan rahasia dapur agar masakan Anda semakin lezat, awet, dan sehat.
        </p>
        <div className="w-24 h-1 bg-[#e6a357] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* GRID TIPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {loading ? (
            <p className="col-span-full text-center text-gray-500 py-10 text-lg">Sedang memuat tips...</p>
        ) : tips.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10 text-lg">Belum ada tips yang tersedia.</p>
        ) : (
            tips.map((tip) => (
                // KARTU TIPS
                <div key={tip.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100 group flex flex-col h-full">
                    
                    {/* GAMBAR */}
                    <div className="relative h-56 overflow-hidden">
                        <img 
                            src={`${IMAGE_BASE_URL}${tip.gambar}`} 
                            alt={tip.judul} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
                        />
                        {/* Overlay Gradien */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                        
                        {/* Judul di atas gambar */}
                        <div className="absolute bottom-0 left-0 w-full p-6">
                            <h3 className="text-xl font-bold text-white font-serif leading-snug shadow-black drop-shadow-md">
                                {tip.judul}
                            </h3>
                        </div>
                    </div>

                    {/* KONTEN (ISI TIPS) */}
                    <div className="p-6 flex-grow bg-white">
                        <div 
                            className="text-gray-600 text-sm leading-relaxed space-y-2"
                            // STYLE PENTING: 
                            // [&>ul]:list-disc -> Paksa ul punya bullet
                            // [&>ul]:pl-5 -> Beri padding kiri agar bullet terlihat
                            // [&>ul>li]:mb-2 -> Beri jarak antar poin
                        >
                           <div 
                                className="[&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-2 marker:text-[#e6a357]"
                                dangerouslySetInnerHTML={{ __html: tip.konten }} 
                           />
                        </div>
                    </div>

                </div>
            ))
        )}

      </div>
    </div>
  );
}