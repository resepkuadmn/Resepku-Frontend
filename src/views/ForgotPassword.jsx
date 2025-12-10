import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios-client";

export default function ForgotPassword() {
  const emailRef = useRef();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (ev) => {
    ev.preventDefault();
    const email = emailRef.current.value;
    
    setLoading(true);
    setError(null);

    axiosClient.post("/forgot-password", { email })
      .then(() => {
        setLoading(false);
        // Pindah ke halaman Verifikasi Kode sambil membawa email
        navigate('/verify-code', { state: { email: email } });
      })
      .catch((err) => {
        setLoading(false);
        const response = err.response;
        if (response && response.status === 404) {
            setError("Email tidak ditemukan.");
        } else {
            setError("Terjadi kesalahan sistem.");
        }
      });
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold text-resepku-dark mb-4">Lupa Password</h2>
      <p className="text-gray-500 text-sm mb-6">
        Masukkan email Anda. Kami akan mengirimkan kode verifikasi.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <input ref={emailRef} type="email" placeholder="Masukkan Email Anda" className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 focus:border-resepku-orange outline-none" required />
        
        <button disabled={loading} className="w-full bg-resepku-orange hover:bg-orange-600 text-white font-bold py-3 rounded-full shadow-md transition">
          {loading ? 'MENGIRIM...' : 'Kirim Kode'}
        </button>
      </form>

      <div className="mt-6">
        <Link to="/login" className="text-gray-400 hover:text-gray-600 text-sm font-medium">Kembali ke Login</Link>
      </div>
    </div>
  );
}