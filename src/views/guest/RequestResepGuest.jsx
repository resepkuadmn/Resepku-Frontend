import { useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { Navigate } from "react-router-dom";

export default function RequestResepGuest() {
  const { token, user } = useStateContext(); // Ambil data user yang sedang login
  
  // --- STATE ---
  const [resepDiminta, setResepDiminta] = useState("");
  const [jenis, setJenis] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Jika belum login, tendang ke login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // --- SUBMIT HANDLER ---
  const onSubmit = (ev) => {
    ev.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const payload = {
      resep_diminta: resepDiminta,
      jenis: jenis
      // Username & Email tidak perlu dikirim manual, 
      // Backend akan mengambilnya dari Token user yang login.
    };

    axiosClient.post('/request', payload)
      .then(() => {
        setLoading(false);
        setMessage("Request berhasil dikirim! Admin akan meninjaunya.");
        setResepDiminta(""); 
        setJenis("");
      })
      .catch((err) => {
        setLoading(false);
        const response = err.response;
        if (response && response.status === 422) {
            setError("Mohon lengkapi semua data.");
        } else {
            setError("Terjadi kesalahan. Coba lagi nanti.");
        }
      });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 font-montserrat animate-fade-in-up">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-[#333] mb-2 font-serif">REQUEST RESEP</h1>
        <p className="text-gray-500">Minta resep favoritmu disini.</p>
        <div className="w-16 h-1 bg-[#e6a357] mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Pesan Sukses/Error */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-center font-bold">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-center font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#e6a357]">
        <form onSubmit={onSubmit} className="space-y-6">
            
            {/* --- BAGIAN OTOMATIS (READ ONLY) --- */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[#3a2e1c] font-bold mb-2 ml-1 text-sm">Username</label>
                    <input 
                        type="text" 
                        value={user.username || ''} // Otomatis dari Login
                        readOnly 
                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed font-medium"
                    />
                </div>
                <div>
                    <label className="block text-[#3a2e1c] font-bold mb-2 ml-1 text-sm">Email</label>
                    <input 
                        type="text" 
                        value={user.email || ''} // Otomatis dari Login
                        readOnly 
                        className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed font-medium"
                    />
                </div>
            </div>
            {/* ----------------------------------- */}

            {/* Input Nama Resep */}
            <div>
                <label className="block text-[#3a2e1c] font-bold mb-2 ml-1">Nama Resep</label>
                <input 
                    type="text" 
                    value={resepDiminta}
                    onChange={(e) => setResepDiminta(e.target.value)}
                    placeholder="Contoh: Soto Ayam Lamongan" 
                    className="w-full p-4 bg-orange-50 border-2 border-[#e6a357]/30 rounded-xl font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:border-[#e6a357] focus:bg-white transition"
                    required
                />
            </div>

            {/* Select Jenis */}
            <div>
                <label className="block text-[#3a2e1c] font-bold mb-2 ml-1">Jenis Resep</label>
                <div className="relative">
                    <select 
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value)}
                        className="w-full p-4 bg-orange-50 border-2 border-[#e6a357]/30 rounded-xl font-medium text-[#333] appearance-none focus:outline-none focus:border-[#e6a357] focus:bg-white transition cursor-pointer"
                        required
                    >
                        <option value="" disabled>Pilih Jenis (Makanan, Minuman, dll)</option>
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Dessert">Dessert</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-[#e6a357] pointer-events-none"></i>
                </div>
            </div>

            {/* Tombol Kirim */}
            <button 
                disabled={loading}
                className={`w-full bg-[#333] text-white font-bold py-4 rounded-xl shadow-md transition duration-300 uppercase tracking-wider
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black hover:shadow-lg'}
                `}
            >
                {loading ? 'MENGIRIM...' : 'KIRIM REQUEST'}
            </button>

        </form>
      </div>

    </div>
  );
}