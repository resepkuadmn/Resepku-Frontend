import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../axios-client";

export default function VerifyCode() {
  const otpRef = useRef();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Pesan sukses resend
  
  // State untuk Timer
  const [countdown, setCountdown] = useState(60); // 60 detik cooldown
  const [canResend, setCanResend] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  // Cek email
  useEffect(() => {
    if (!email) navigate('/login');
  }, []);

  // Logika Timer Mundur
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Fungsi Submit OTP
  const onSubmit = (ev) => {
    ev.preventDefault();
    const otp = otpRef.current.value;
    setError(null);
    setLoading(true);

    axiosClient.post("/verify-otp", { email, otp })
      .then(() => {
        setLoading(false);
        navigate('/reset-password', { state: { email: email } });
      })
      .catch((err) => {
        setLoading(false);
        setError("Kode OTP salah atau sudah kadaluwarsa.");
      });
  };

  // Fungsi Kirim Ulang
  const handleResend = () => {
    if (!canResend) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    axiosClient.post("/forgot-password", { email })
      .then(() => {
        setLoading(false);
        setCountdown(60); // Reset timer
        setCanResend(false);
        setMessage("Kode baru telah dikirim ke email Anda.");
      })
      .catch(() => {
        setLoading(false);
        setError("Gagal mengirim ulang kode.");
      });
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg text-center animate-fade-in-up w-full max-w-md">
      <h2 className="text-2xl font-bold text-resepku-dark mb-2">Verifikasi Kode</h2>
      <p className="text-gray-500 text-sm mb-6">
        Kode 6 digit telah dikirim ke <strong className="text-resepku-dark">{email}</strong>
      </p>

      {/* Pesan Error / Sukses */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">{message}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <input 
            ref={otpRef} 
            type="text" 
            placeholder="000000" 
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 focus:border-resepku-orange outline-none text-center text-2xl tracking-[0.5em] font-bold text-resepku-dark" 
            maxLength={6} 
            required 
        />
        
        <button 
            disabled={loading}
            className={`w-full font-bold py-3 rounded-full shadow-md transition duration-300 text-white
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-resepku-orange hover:bg-orange-600'}
            `}
        >
          {loading ? 'MEMPROSES...' : 'VERIFIKASI'}
        </button>
      </form>
      
      <div className="mt-6 text-sm text-gray-600">
        Belum menerima kode? <br/>
        
        {/* Tombol Resep dengan Logika Cooldown */}
        <button 
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`mt-2 font-bold transition duration-300 
                ${canResend 
                    ? 'text-resepku-orange hover:underline cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'}
            `}
        >
            {canResend ? "Kirim Ulang Kode" : `Kirim Ulang (${countdown}s)`}
        </button>

      </div>
    </div>
  );
}