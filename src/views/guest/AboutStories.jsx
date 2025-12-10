import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";

export default function AboutStories() {
  const [abouts, setAbouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const IMAGE_BASE_URL = "http://127.0.0.1:8000/gambar/";

  useEffect(() => {
    axiosClient.get('/about')
      .then(({ data }) => {
        setAbouts(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 font-montserrat animate-fade-in-up">
      
      <h1 className="text-center text-3xl md:text-4xl font-black text-[#333] mb-16 leading-tight font-serif">
        MENGENAL RASA DAN CERITA<br />DI BALIK RESEP
      </h1>

      {loading ? (
         <p className="text-center text-gray-500">Memuat cerita...</p>
      ) : (
        <div className="space-y-20">
            {abouts.map((item, index) => {
                // Logika Zig-Zag: Genap gambar kiri, Ganjil gambar kanan (atau sesuai field layout db)
                // Kita prioritaskan field 'layout' dari DB, jika tidak ada pakai index
                const isRight = item.layout === 'kanan';

                return (
                    <div 
                        key={item.id} 
                        className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 
                        ${isRight ? 'md:flex-row-reverse' : ''}`}
                    >
                        {/* Gambar (Lingkaran) */}
                        <div className="w-64 h-64 flex-shrink-0">
                            <div className="w-full h-full rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-[#e6a357]">
                                <img 
                                    src={`${IMAGE_BASE_URL}${item.gambar}`} 
                                    alt={item.judul} 
                                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                                />
                            </div>
                        </div>

                        {/* Konten (Teks) */}
                        <div className={`flex-grow text-center ${isRight ? 'md:text-left' : 'md:text-right'}`}>
                            <h2 className="text-3xl font-black text-[#e6a357] mb-4 font-serif drop-shadow-sm">
                                {item.judul}
                            </h2>
                            <div className="bg-white p-8 rounded-2xl shadow-md border border-orange-100 relative">
                                <p className="font-medium leading-loose text-gray-600 text-justify">
                                    {item.deskripsi}
                                </p>
                                {/* Hiasan Segitiga Kecil */}
                                <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l border-orange-100 transform rotate-45
                                     ${isRight ? '-right-2 border-r border-t border-b-0 border-l-0' : '-left-2'}
                                `}></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}