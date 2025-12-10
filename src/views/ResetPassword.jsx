import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../axios-client";

export default function ResetPassword() {
  // use controlled inputs so we can show live comparison + visibility toggles
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => { if (!email) navigate('/login'); }, []);

  const onSubmit = (ev) => {
    ev.preventDefault();
    
    const payload = {
      email: email,
      password: newPassword,
      password_confirmation: confirmPassword
    }

    axiosClient.post("/reset-password", payload)
      .then(({data}) => {
        // Sukses! Balik ke Login dengan pesan sukses
        navigate('/login', { state: { successMessage: data.message } });
      })
      .catch((err) => {
         setError("Pastikan password minimal 6 karakter dan konfirmasi cocok.");
      });
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold text-resepku-dark mb-6">Buat Password Baru</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="relative">
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showNewPassword ? "text" : "password"} placeholder="Password Baru" className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 focus:border-resepku-orange outline-none" required />
          <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-resepku-dark">
            <i className={`fas ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          </button>
        </div>

        <div className="relative">
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password" className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 focus:border-resepku-orange outline-none" required />
          <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-resepku-dark">
            <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          </button>
        </div>

        {/* live match indicator */}
        {newPassword.length > 0 && confirmPassword.length > 0 && (
          <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'} text-left`}> 
            {newPassword === confirmPassword ? 'Password cocok ✔' : 'Password tidak cocok'}
          </div>
        )}
        
        <button className="w-full bg-resepku-orange hover:bg-orange-600 text-white font-bold py-3 rounded-full shadow-md transition">
          Simpan Password
        </button>
      </form>
    </div>
  );
}