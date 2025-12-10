import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function AboutForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State Data
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [layout, setLayout] = useState("kiri"); // Posisi gambar: kiri atau kanan
  // State Gambar
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // File asli untuk diupload
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const { showToast } = useStateContext();
   const [submitting, setSubmitting] = useState(false);

  // --- BASE URL GAMBAR (Laravel) ---
  const IMAGE_BASE_URL = "http://127.0.0.1:8000/gambar/";

  // --- 1. FETCH DATA (JIKA EDIT) ---
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/about/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const d = data.data;
          setJudul(d.judul);
          setDeskripsi(d.deskripsi);
          setLayout(d.layout || "kiri"); // Default ke kiri jika tidak ada
          if (d.gambar) {
            // Gunakan URL lengkap ke backend
            setImagePreview(`${IMAGE_BASE_URL}${d.gambar}`);
          }
        })
        .catch(() => {
          setLoading(false);
          showToast && showToast("Gagal mengambil data", { type: 'error' });
        });
    } else {
      // Jika tidak ada id (mode create/tambah), reset form dan gambar
      setImagePreview(null);
      setImageFile(null);
      setJudul('');
      setDeskripsi('');
      setLayout("kiri"); // Default ke kiri
    }
  }, [id]);

  // --- 2. HANDLER GAMBAR ---
  const onImageClick = () => fileInputRef.current.click();
  
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        // Buat preview lokal dari file yang baru dipilih
        setImagePreview(URL.createObjectURL(file));
    }
  }

  // --- 3. SUBMIT DATA ---
  const onSubmit = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    console.log('AboutForm onSubmit invoked, id=', id);
       if (submitting) return;
       setSubmitting(true);
       showToast && showToast('Mengirim...', { type: 'success', duration: 800 });
    
    const payload = new FormData();
    payload.append('judul', judul);
    payload.append('deskripsi', deskripsi);
    payload.append('layout', layout); // Tambah field layout
    if (imageFile) {
        payload.append('gambar', imageFile);
    }

    const url = id ? `/about/${id}` : '/about';

    axiosClient.post(url, payload)
      .then(() => {
        if (typeof showToast === 'function') {
          showToast('Data Berhasil Disimpan!', { type: 'success' });
        } else {
          alert('Data Berhasil Disimpan!');
        }
        navigate('/admin/about'); // Kembali ke List About
      })
      .catch(err => {
        console.error('AboutForm save error:', err.response || err);
        const serverMsg = err?.response?.data?.message || err?.message || 'Gagal menyimpan data.';
        if (typeof showToast === 'function') {
          showToast(serverMsg, { type: 'error' });
        } else {
          alert(serverMsg);
        }
      })
      .finally(() => setSubmitting(false));
  }

  // Style Class (Agar seragam dengan form lain)
  const inputClass = "w-full p-3 rounded-xl border-2 border-[#3a2e1c] bg-[#e6a357] text-[#3a2e1c] placeholder-[#3a2e1c]/70 font-medium focus:outline-none focus:ring-2 focus:ring-[#3a2e1c] transition";
  const labelClass = "block font-bold text-[#3a2e1c] mb-2 text-sm";


  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-sm mt-6 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        {/* PERBAIKAN JUDUL */}
        <h1 className="text-3xl font-bold text-[#333] font-serif">
            {id ? 'Edit About' : 'Tambah About'}
        </h1>
        <Link to="/admin/about" className="text-gray-500 hover:text-[#3a2e1c] text-sm">
            &larr; Kembali
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
            
            {/* --- AREA UPLOAD FOTO (Gaya Thumbnail Rapi) --- */}
            <div className="flex flex-col items-center gap-4 mb-8">
                
                {/* 1. Preview Gambar Kecil */}
                {imagePreview && (
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 mb-2">Gambar Saat Ini:</p>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            // Class ini membuat gambar jadi thumbnail rapi (tidak gepeng)
                            className="w-40 h-28 object-cover rounded-lg border-2 border-gray-300 shadow-sm mx-auto"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} 
                        />
                    </div>
                )}

                {/* 2. Kotak Upload Dashed */}
                <div 
                    onClick={onImageClick}
                    className="w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition text-center p-2"
                >
                    <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                    <span className="text-xs font-bold text-gray-500">
                        {id ? 'Klik Ganti Foto' : 'Klik Upload Foto'}
                    </span>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={onImageChange} 
                    />
                </div>
            </div>
            {/* ------------------------------------------------ */}


            {/* Input Judul */}
            <div>
                <label className={labelClass}>Judul</label>
                <input 
                    type="text" 
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className={inputClass}
                    placeholder="Judul Cerita"
                />
            </div>

            {/* Input Deskripsi */}
            <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea 
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows="10" 
                    className={inputClass}
                    placeholder="Tulis cerita di balik layar..."
                ></textarea>
            </div>

            {/* Input Posisi Gambar */}
            <div>
                <label className={labelClass}>Posisi Gambar</label>
                <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer gap-2">
                        <input 
                            type="radio" 
                            name="layout" 
                            value="kiri"
                            checked={layout === "kiri"}
                            onChange={(e) => setLayout(e.target.value)}
                            className="w-5 h-5 accent-[#3a2e1c]"
                        />
                        <span className="font-medium text-[#3a2e1c]">Gambar di Kiri</span>
                    </label>
                    <label className="flex items-center cursor-pointer gap-2">
                        <input 
                            type="radio" 
                            name="layout" 
                            value="kanan"
                            checked={layout === "kanan"}
                            onChange={(e) => setLayout(e.target.value)}
                            className="w-5 h-5 accent-[#3a2e1c]"
                        />
                        <span className="font-medium text-[#3a2e1c]">Gambar di Kanan</span>
                    </label>
                </div>
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex justify-between pt-6">
              <Link to="/admin/about" className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition">
                Batal
              </Link>
              <button
                type="button"
                onClick={() => { console.log('Simpan About clicked'); onSubmit(); }}
                disabled={submitting}
                className={`bg-[#3a2e1c] text-white font-bold py-3 px-10 rounded-lg hover:bg-black transition shadow-md ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Mengirim...' : 'Simpan Data'}
              </button>
            </div>

        </form>
      )}
    </div>
  );
}