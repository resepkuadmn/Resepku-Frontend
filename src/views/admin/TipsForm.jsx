import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function TipsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [tips, setTips] = useState({
    judul: '',
    konten: '',
    gambar: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const { showToast } = useStateContext();
  const [submitting, setSubmitting] = useState(false);

  // --- HELPER: HTML <-> TEXT ---
  // Ini yang mengubah <ul><li>Teks</li></ul> menjadi Teks biasa (tanpa kode)
  const htmlToText = (html) => {
    if (!html || html === '0') return ""; // Fix jika data di DB isinya angka 0
    return html
        .replace(/<\/?ul>/g, "") 
        .replace(/<\/li>/g, "\n") 
        .replace(/<li>/g, "")
        .trim();
  };

  const textToHtml = (text) => {
    if (!text) return "";
    return "<ul>" + text.split("\n").map(line => line.trim()).filter(l => l).map(line => `<li>${line}</li>`).join("") + "</ul>";
  };

  // --- FETCH DATA (EDIT MODE) ---
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/tips/${id}`).then(({ data }) => {
        setLoading(false);
        const d = data.data;
        setTips({
            judul: d.judul,
            konten: htmlToText(d.konten), // Bersihkan HTML saat ditampilkan
            gambar: null
        });
        if (d.gambar) setImagePreview(`/gambar/${d.gambar}`);
      });
    } else {
      // Jika tidak ada id (mode create/tambah), reset form dan gambar
      setImagePreview(null);
      setTips({
        judul: '',
        konten: '',
        gambar: null
      });
    }
  }, [id]);

  const onImageClick = () => fileInputRef.current.click();

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setTips({ ...tips, gambar: file });
        setImagePreview(URL.createObjectURL(file));
    }
  }

  const onSubmit = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    console.log('TipsForm onSubmit invoked, id=', id);
    if (submitting) return;
    setSubmitting(true);
    showToast && showToast('Mengirim...', { type: 'success', duration: 800 });
    const payload = new FormData();
    payload.append('judul', tips.judul);
    payload.append('konten', textToHtml(tips.konten)); // Ubah ke HTML saat simpan
    if (tips.gambar instanceof File) payload.append('gambar', tips.gambar);

    axiosClient.post(id ? `/tips/${id}` : '/tips', payload)
      .then(() => {
        if (typeof showToast === 'function') showToast('Tips berhasil disimpan!', { type: 'success' });
        else alert('Tips berhasil disimpan!');
        navigate('/admin/tips', { state: { toast: { message: 'Tips berhasil disimpan!', type: 'success' } } });
      })
      .catch(err => {
        console.error('TipsForm save error:', err.response || err);
        const serverMsg = err?.response?.data?.message || 'Gagal menyimpan tips.';
        if (typeof showToast === 'function') showToast(serverMsg, { type: 'error' });
        else alert(serverMsg);
      })
      .finally(() => setSubmitting(false));
  }

  // STYLE CLASS (Sama dengan ResepForm)
  const inputClass = "w-full p-3 rounded-xl border-2 border-[#3a2e1c] bg-[#e6a357] text-[#3a2e1c] placeholder-[#3a2e1c]/70 font-medium focus:outline-none focus:ring-2 focus:ring-[#3a2e1c] transition";
  const labelClass = "block font-bold text-[#3a2e1c] mb-2 text-sm";

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-sm mt-6 animate-fade-in-up pb-20">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-[#333] font-serif">
            {id ? 'Edit Tips' : 'Tambah Tips'}
        </h1>
        <Link to="/admin/tips" className="text-gray-500 hover:text-[#3a2e1c] text-sm">&larr; Kembali</Link>
      </div>

      {loading ? <div className="text-center">Loading...</div> : (
      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* Gambar */}
        <div className="flex flex-col items-center gap-4 mb-8">
            {imagePreview && (
                <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 mb-2">Gambar Saat Ini:</p>
                    <img src={imagePreview} alt="Preview" className="w-40 h-28 object-cover rounded-lg border-2 border-gray-300 shadow-sm mx-auto" 
                         onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} />
                </div>
            )}
            <div 
                onClick={onImageClick}
                className="w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition text-center p-2"
            >
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <span className="text-xs font-bold text-gray-500">Klik Ganti Foto</span>
                <input type="file" ref={fileInputRef} className="hidden" onChange={onImageChange} />
            </div>
        </div>

        {/* Judul */}
        <div>
            <label className={labelClass}>Judul Tips</label>
            <input 
                type="text" 
                value={tips.judul}
                onChange={e => setTips({...tips, judul: e.target.value})}
                className={inputClass} 
            />
        </div>

        {/* Konten */}
        <div>
            <label className={labelClass}>Konten (Satu baris satu poin)</label>
            <textarea 
                value={tips.konten}
                onChange={e => setTips({...tips, konten: e.target.value})}
                rows="10" 
                className={inputClass}
            ></textarea>
        </div>

        <div className="flex justify-between pt-6">
            <Link to="/admin/tips" className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition">
                Batal
            </Link>
            <button
              type="button"
              onClick={() => { console.log('Simpan Tips clicked'); onSubmit(); }}
              disabled={submitting}
              className={`bg-[#3a2e1c] text-white font-bold py-3 px-10 rounded-lg hover:bg-black transition shadow-md ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Mengirim...' : 'Simpan Tips'}
            </button>
        </div>
      </form>
      )}
    </div>
  );
}