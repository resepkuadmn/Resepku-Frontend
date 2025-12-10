import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios-client";

export default function Register() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmationRef = useRef();
  
  const [errors, setErrors] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- FUNGSI NAVIGASI DENGAN ANIMASI ---

  const goToLogin = (ev) => {
    ev?.preventDefault();
    setIsAnimating(true);
    setTimeout(() => navigate('/login', { state: { fromRegister: true } }), 500);
  };

  // BARU: Fungsi ke Home
  const goToHome = (ev) => {
    ev?.preventDefault();
    setIsAnimating(true);
    setTimeout(() => navigate('/'), 500);
  };

  // --------------------------------------

  const onSubmit = (ev) => {
    ev.preventDefault();
    setErrors(null);
    setIsAnimating(true);

    const payload = {
      username: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value, 
    };
    
    setTimeout(() => {
      navigate('/login', {
        state: {
          successMessage: 'Akun Anda telah terdaftar, silahkan login',
        },
      });

      axiosClient.post("/register", payload)
        .then((response) => {
          console.log("Register Success:", response.data);
        })
        .catch((err) => {
          console.error("Register Error:", err);
        });
    }, 500);
  };

  const animationClass = isAnimating || !mounted
    ? 'scale-95 opacity-0' 
    : 'scale-100 opacity-100';

  return (
    <div 
      className={`bg-white p-10 rounded-xl shadow-lg text-center transform transition-all duration-500 ease-in-out ${animationClass}`}
    >
      <h2 className="text-3xl font-bold text-resepku-dark mb-6 uppercase">
        REGISTER
      </h2>

      {errors && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-left text-sm">
          {Object.keys(errors).map((key) => (
            <p key={key}>• {errors[key][0]}</p>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        
        <div>
          <input 
            ref={nameRef} 
            type="text" 
            placeholder="Nama (Username)" 
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange transition-colors" 
            required 
          />
        </div>

        <div>
          <input 
            ref={emailRef} 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange transition-colors" 
            required 
          />
        </div>

        <div className="relative">
          <input 
            ref={passwordRef} 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange transition-colors pr-10" 
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-resepku-dark"
          >
            <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          </button>
        </div>

        <div>
          <input 
            ref={passwordConfirmationRef} 
            type={showPassword ? "text" : "password"} 
            placeholder="Konfirmasi Password" 
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange transition-colors" 
            required 
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
          <input 
            type="checkbox" 
            id="terms" 
            required 
            className="w-4 h-4 accent-resepku-orange" 
          />
          <label htmlFor="terms" className="cursor-pointer hover:text-resepku-orange">
            Setuju Syarat & Ketentuan
          </label>
        </div>

        <button 
          type="submit"
          className="w-full bg-resepku-orange hover:bg-orange-500 text-white font-bold py-3 rounded-full shadow-md transition duration-300 text-base uppercase tracking-wider"
        >
          DAFTAR
        </button>

      </form>

      <div className="text-gray-400 text-xs mt-6 mb-2">Atau sudah memiliki akun?</div>

      <a
        href="/login"
        onClick={goToLogin}
        className="block w-full py-3 rounded-full border-2 border-dotted border-gray-300 text-gray-600 font-bold hover:border-resepku-orange hover:text-resepku-orange transition duration-300 text-base no-underline cursor-pointer"
      >
        Masuk
      </a>

      <div className="mt-5">
        {/* UPDATE DI SINI: Link Home dengan animasi */}
        <a 
          href="/" 
          onClick={goToHome}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium cursor-pointer"
        >
          Kembali ke home
        </a>
      </div>
    </div>
  );
}