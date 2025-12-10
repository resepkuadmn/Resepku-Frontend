import { useState, useEffect, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";

export default function ResepForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [resep, setResep] = useState({
    judul: '',
    jenis: '',
    waktu: '',
    porsi: '',
    bahan: '',
    cara_membuat: '',
    gambar: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const fileInputRef = useRef();
  const { showToast } = useStateContext();
  const [submitting, setSubmitting] = useState(false);

  // --- HELPER: Konversi HTML <-> Teks ---
  const htmlToText = (html) => {
    if (!html) return "";
    return html.replace(/<\/?li>/g, "\n").replace(/<\/?ul>/g, "").trim().split("\n").filter(r => r.trim() !== "").join("\n");
  };

  const textToHtml = (text) => {
    if (!text) return "";
    return text.split("\n").map(line => line.trim()).filter(line => line !== "").map(line => `<li>${line}</li>`).join("");
  };

  // --- FETCH DATA UNTUK EDIT ---
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/resep/${id}`).then(({ data }) => {
        setLoading(false);
        const d = data.data;
        setResep({
            ...d,
            bahan: htmlToText(d.bahan),
            cara_membuat: htmlToText(d.cara_membuat),
            gambar: null
        });
        if (d.gambar) setImagePreview(`/gambar/${d.gambar}`);
      });
    } else {
      // Jika tidak ada id (mode create/tambah), reset form dan gambar
      setImagePreview(null);
      setResep({
        judul: '',
        jenis: '',
        waktu: '',
        porsi: '',
        bahan: '',
        cara_membuat: '',
        gambar: null
      });
    }
  }, [id]);

  // --- HANDLERS ---
  const onImageClick = () => fileInputRef.current.click();
  
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setResep({ ...resep, gambar: file });
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    console.log('ResepForm onSubmit invoked, id=', id);
    if (submitting) return; // prevent double submit
    setSubmitting(true);
    showToast && showToast('Mengirim...', { type: 'success', duration: 800 });
    const payload = new FormData();
    payload.append('judul', resep.judul);
    payload.append('jenis', resep.jenis);
    payload.append('waktu', resep.waktu);
    payload.append('porsi', resep.porsi);
    payload.append('bahan', textToHtml(resep.bahan));
    payload.append('cara_membuat', textToHtml(resep.cara_membuat));
    if (resep.gambar instanceof File) payload.append('gambar', resep.gambar);

    axiosClient.post(id ? `/resep/${id}` : '/resep', payload)
      .then(() => {
        // navigate and pass toast via location state so the list page can show it
        navigate('/admin/resep', { state: { toast: { message: 'Data Berhasil Disimpan!', type: 'success' } } });
      })
      .catch(err => {
        console.error('ResepForm save error:', err.response || err);
        if (err.response && err.response.status === 422) {
          setErrors(err.response.data.errors);
        } else {
          const serverMsg = err?.response?.data?.message || 'Gagal menyimpan data.';
          if (typeof showToast === 'function') showToast(serverMsg, { type: 'error' });
          else alert(serverMsg);
        }
      })
      .finally(() => setSubmitting(false));
  };

  // STYLE CLASS (Agar rapi dan seragam seperti screenshot)
  const inputClass = "w-full p-3 rounded-xl border-2 border-[#3a2e1c] bg-[#e6a357] text-[#3a2e1c] placeholder-[#3a2e1c]/70 font-medium focus:outline-none focus:ring-2 focus:ring-[#3a2e1c] transition";
  const labelClass = "block font-bold text-[#3a2e1c] mb-2 text-sm";

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-sm mt-6 animate-fade-in-up pb-20">
      
      <h1 className="text-3xl font-bold text-[#333] mb-6 font-serif border-b border-gray-200 pb-4">
        {id ? 'Edit Resep' : 'Tambah Resep'}
      </h1>

      {loading ? <div className="text-center py-10">Loading...</div> : (
        
        <form onSubmit={onSubmit} className="space-y-6">

          {/* --- BAGIAN GAMBAR --- */}
          <div className="flex flex-col items-center gap-4 mb-8">
              
              {/* 1. Preview Gambar Lama (Kecil di Tengah) */}
              {imagePreview && (
                  <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 mb-2">Gambar Saat Ini:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-40 h-28 object-cover rounded-lg border-2 border-gray-300 shadow-sm mx-auto"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} 
                      />
                  </div>
              )}

              {/* 2. Kotak Upload (Dashed) */}
              <div 
                  onClick={onImageClick}
                  className="w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition text-center p-2"
              >
                  <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                  <span className="text-xs font-bold text-gray-500">Klik untuk Ganti Foto</span>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={onImageChange} />
              </div>
              {errors?.gambar && <p className="text-red-500 text-xs">{errors.gambar[0]}</p>}
          </div>

          {/* --- FORM INPUTS (SESUAI STYLE PHP) --- */}
          
          {/* Nama Menu */}
          <div>
              <label className={labelClass}>Nama Menu:</label>
              <input 
                type="text" 
                value={resep.judul} 
                onChange={e => setResep({...resep, judul: e.target.value})} 
                className={inputClass} 
              />
          </div>

          {/* Kategori */}
          <div className="relative">
              <label className={labelClass}>Kategori:</label>
              <select 
                value={resep.jenis} 
                onChange={e => setResep({...resep, jenis: e.target.value})} 
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                  <option value="" disabled>Pilih Kategori</option>
                  <option value="makanan">Makanan</option>
                  <option value="minuman">Minuman</option>
                  <option value="dessert">Dessert</option>
              </select>
              {/* Panah Dropdown Custom */}
              <i className="fas fa-caret-down absolute right-4 top-[45px] text-[#3a2e1c] text-xl pointer-events-none"></i>
          </div>

          {/* Waktu */}
          <div>
              <label className={labelClass}>Waktu Memasak:</label>
              <input 
                type="text" 
                value={resep.waktu} 
                onChange={e => setResep({...resep, waktu: e.target.value})} 
                className={inputClass} 
              />
          </div>

          {/* Porsi */}
          <div>
              <label className={labelClass}>Porsi:</label>
              <input 
                type="text" 
                value={resep.porsi} 
                onChange={e => setResep({...resep, porsi: e.target.value})} 
                className={inputClass} 
              />
          </div>

          {/* Bahan (Textarea) */}
          <div>
              <label className={labelClass}>Bahan-Bahan (Satu baris satu item):</label>
              <textarea 
                rows="6" 
                value={resep.bahan} 
                onChange={e => setResep({...resep, bahan: e.target.value})} 
                className={inputClass}
              ></textarea>
          </div>

          {/* Cara Membuat (Textarea) */}
          <div>
              <label className={labelClass}>Cara Membuat (Satu baris satu langkah):</label>
              <textarea 
                rows="8" 
                value={resep.cara_membuat} 
                onChange={e => setResep({...resep, cara_membuat: e.target.value})} 
                className={inputClass}
              ></textarea>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-between pt-6">
               <Link to="/admin/resep" className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition">
                  Batal
              </Link>
                  <button
                    type="button"
                    onClick={() => { console.log('Simpan clicked'); onSubmit(); }}
                    disabled={submitting}
                    className={`bg-[#3a2e1c] text-white font-bold py-3 px-10 rounded-lg hover:bg-black transition shadow-md ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Mengirim...' : 'Simpan'}
                  </button>
          </div>

        </form>
      )}
    </div>
  );
}