import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";
import ConfirmModal from '../../components/ConfirmModal';

export default function ListTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useStateContext();

  // Base URL ke Server Laravela
  const IMAGE_BASE_URL = "/gambar/";

  const getTips = () => {
    setLoading(true);
    axiosClient.get('/tips')
      .then(({ data }) => {
        setTips(data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getTips();
  }, []);

  // Show toast passed via navigation state & refresh data
  useEffect(() => {
    if (location && location.state && location.state.toast) {
      const t = location.state.toast;
      if (typeof showToast === 'function') {
        showToast(t.message, { type: t.type || 'success' });
      }
      navigate(location.pathname, { replace: true, state: {} });
      getTips();
    }
  }, [location, navigate, showToast]);

  // confirm / success states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const openDeleteConfirm = (id) => {
    setTargetId(id);
    setConfirmOpen(true);
  }

  const handleConfirmDelete = () => {
    if (!targetId) return;
    axiosClient.delete(`/tips/${targetId}`)
      .then(() => {
        setSuccessMsg('Tips berhasil dihapus');
        setConfirmOpen(false);
        setTargetId(null);
        getTips();
        setTimeout(() => setSuccessMsg(null), 2500);
      })
      .catch(() => {
        setConfirmOpen(false);
        setTargetId(null);
      });
  };

  // Fungsi Helper untuk URL Gambar yang aman (mengatasi spasi)
  const getImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/150?text=No+Image';
    // encodeURIComponent akan mengubah spasi menjadi %20 agar terbaca browser
    return `${IMAGE_BASE_URL}${filename}`; 
  }

  return (
    <div className="p-6 animate-fade-in-up">
      
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-resepku-dark font-serif">Daftar Tips Dapur</h1>
          <Link 
            to="/admin/tips/create" 
            className="bg-resepku-brown text-white px-4 py-2 rounded-md font-bold hover:bg-black transition shadow-md"
          >
            + Tambah Tips
          </Link>
      </div>

      <div className="bg-resepku-orange rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-resepku-orange text-resepku-dark border-b-2 border-white">
                    <th className="p-4 font-bold w-16">No</th>
                    <th className="p-4 font-bold w-32">Gambar</th>
                    <th className="p-4 font-bold">Judul Tips</th>
                    <th className="p-4 font-bold w-48">Aksi</th>
                </tr>
            </thead>
            <tbody className="bg-white">
                {loading && (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">Memuat data...</td></tr>
                )}

                {!loading && tips.length === 0 && (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">Belum ada tips.</td></tr>
                )}

                {!loading && tips.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4">
                            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden shadow-sm border border-gray-300">
                                {/* Menggunakan fungsi helper getImageUrl */}
                                <img 
                                    src={getImageUrl(item.gambar)}
                                    alt={item.judul} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'}
                                />
                            </div>
                        </td>
                        <td className="p-4 font-bold text-resepku-dark">{item.judul}</td>
                        <td className="p-4 flex gap-2">
                            <Link 
                                to={`/admin/tips/edit/${item.id}`} 
                                className="bg-resepku-orange text-white px-3 py-1 rounded font-bold text-sm hover:opacity-80 transition"
                            >
                                Edit
                            </Link>
                            <button 
                              onClick={() => openDeleteConfirm(item.id)} 
                                className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm hover:bg-red-700 transition"
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          {successMsg}
        </div>
      )}

      <ConfirmModal open={confirmOpen} title="Yakin ingin menghapus tips ini?" message="Data tips yang dipilih akan dihapus" confirmLabel="Hapus" cancelLabel="Batal" onConfirm={handleConfirmDelete} onCancel={() => { setConfirmOpen(false); setTargetId(null); }} />
    </div>
  );
}