import { useEffect, useState } from "react";
import { useStateContext } from '../../contexts/ContextProvider';
import axiosClient from "../../axios-client";

export default function RequestResep() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // State untuk melacak ID mana yang sedang diproses agar tombolnya loading
  const [processingId, setProcessingId] = useState(null);

  const getRequests = () => {
    // Jangan set loading true disini agar tidak berkedip satu layar
    axiosClient.get('/admin/request')
      .then(({ data }) => {
        setRequests(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    getRequests();
  }, []);

    const { showToast } = useStateContext();

  const updateStatus = (id, statusBaru) => {
    // Set tombol jadi loading
    setProcessingId(id);

    axiosClient.put(`/admin/request/${id}`, { status: statusBaru })
      .then(() => {
        // update lokal state agar UI langsung berubah tanpa nunggu fetch ulang
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === id ? { ...req, status: statusBaru } : req
            )
        );
        setProcessingId(null); // Matikan loading
        // show toast instead of alert
        showToast && showToast(`Berhasil ${statusBaru}`, { type: 'success' });
      })
      .catch(err => {
        console.error(err);
        setProcessingId(null);
        showToast && showToast("Gagal mengupdate status.", { type: 'error' });
      });
  };

  return (
    <div className="p-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-resepku-dark mb-2 font-serif">Kelola Request Resep</h1>
      <p className="text-gray-500 mb-8">Daftar permintaan resep asli dari pengguna.</p>

      <div className="bg-resepku-orange rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-resepku-orange text-resepku-dark border-b-2 border-white">
                    <th className="p-4 font-bold">No</th>
                    <th className="p-4 font-bold">Username</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Resep</th>
                    <th className="p-4 font-bold">Jenis</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="bg-white">
                {loading && (
                    <tr><td colSpan="7" className="text-center p-8 text-gray-500">Memuat data...</td></tr>
                )}

                {!loading && requests.length === 0 && (
                    <tr><td colSpan="7" className="text-center p-8 text-gray-500">Tidak ada request pending.</td></tr>
                )}

                {!loading && requests.map((req, index) => (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">{index + 1}.</td>
                        <td className="p-4 font-medium">{req.user ? req.user.username : req.username}</td>
                        <td className="p-4 text-blue-600">{req.user ? req.user.email : req.email}</td>
                        <td className="p-4 font-bold text-resepku-brown">{req.resep_diminta}</td>
                        <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider">
                                {req.jenis}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white
                                ${req.status === 'pending' ? 'bg-yellow-400' : 
                                  req.status === 'disetujui' ? 'bg-green-500' : 'bg-red-500'}
                            `}>
                                {req.status}
                            </span>
                        </td>
                        
                        <td className="p-4 flex justify-center gap-2">
                            {req.status === 'pending' ? (
                                <>
                                    {/* Jika sedang diproses, tombol mati dan tulisan berubah */}
                                    <button 
                                        onClick={() => updateStatus(req.id, 'disetujui')}
                                        disabled={processingId === req.id}
                                        className={`px-3 py-1 rounded font-bold text-sm transition shadow-sm text-white
                                            ${processingId === req.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
                                        `}
                                    >
                                        {processingId === req.id ? '...' : 'Setuju'}
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(req.id, 'ditolak')}
                                        disabled={processingId === req.id}
                                        className={`px-3 py-1 rounded font-bold text-sm transition shadow-sm text-white
                                            ${processingId === req.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}
                                        `}
                                    >
                                        {processingId === req.id ? '...' : 'Tolak'}
                                    </button>
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm italic font-medium">
                                    {req.status === 'disetujui' ? 'Telah Disetujui' : 'Telah Ditolak'}
                                </span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}