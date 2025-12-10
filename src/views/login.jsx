import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function Login() {
  // Refs
  const loginRef = useRef();
  const passwordRef = useRef();
  
  // Context
  const { setUser, setToken } = useStateContext();
  
  // Router
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [errors, setErrors] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [freezeAnimation, setFreezeAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || null
  );

  // Effects
  useEffect(() => {
    setMounted(true);
    
    const animationTimer = setTimeout(() => {
      setFreezeAnimation(true);
    }, 550);

    let successTimer;
    if (successMessage) {
      successTimer = setTimeout(() => setSuccessMessage(null), 5000);
    }

    return () => {
      clearTimeout(animationTimer);
      if (successTimer) clearTimeout(successTimer);
    };
  }, [successMessage]);

  // Handlers
  const handleNavigate = (path, state = {}) => {
    setFreezeAnimation(false);
    setIsAnimatingOut(true);
    
    setTimeout(() => {
      navigate(path, state);
    }, 500);
  };

  const goToRegister = (ev) => {
    ev?.preventDefault();
    handleNavigate("/register", { state: { fromLogin: true } });
  };

  const goToForgotPassword = (ev) => {
    ev?.preventDefault();
    handleNavigate("/forgot-password");
  };

  const goToHome = (ev) => {
    ev?.preventDefault();
    handleNavigate("/");
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFreezeAnimation(true);

    const payload = {
      login: loginRef.current.value,
      password: passwordRef.current.value
    };

    axiosClient
      .post("/login", payload)
      .then(({ data }) => {
        setIsSubmitting(false);
        
        if (data && data.access_token) {
          setUser(data.data || data.user || {});
          setToken(data.access_token);
          handleNavigate("/dashboard");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        setFreezeAnimation(true);

        const response = err.response;
        
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        } else if (response && response.status === 401) {
          setErrors({ server: [response.data?.message || "Password atau username salah"] });
        } else if (response) {
          setErrors({ 
            server: [response.data.message || "Terjadi kesalahan pada sistem."] 
          });
        } else {
          setErrors({ 
            network: ["Tidak dapat terhubung ke server. Periksa koneksi internet Anda."] 
          });
        }
      });
  };

  // Animation classes
  const transitionClass = freezeAnimation 
    ? "" 
    : "transition-all duration-500 ease-in-out";
  
  const animationState = (() => {
    if (!mounted) return "scale-95 opacity-0";
    if (isAnimatingOut) return "scale-95 opacity-0";
    return "scale-100 opacity-100";
  })();

  return (
    <div
      className={`bg-white p-10 rounded-xl shadow-lg text-center transform ${transitionClass} ${animationState}`}
    >
      {/* Header */}
      <h2 className="text-3xl font-bold text-resepku-dark mb-6 uppercase">
        MASUK
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-6 text-left text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-left text-sm">
          {Object.keys(errors).map((key) => (
            <p key={key}>• {errors[key][0]}</p>
          ))}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email/Username Input */}
        <div>
          <input
            ref={loginRef}
            type="text"
            placeholder="Email atau Username"
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md border-2 border-dotted border-gray-300 placeholder-gray-400 text-gray-700 focus:outline-none focus:border-resepku-orange pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-resepku-dark"
          >
            <i className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-xs text-center text-gray-500 mt-1">
          <span className="mr-1">Lupa password?</span>
          <a
            href="/forgot-password"
            onClick={goToForgotPassword}
            className="text-resepku-orange hover:underline font-medium cursor-pointer"
          >
            Reset password Anda
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-bold py-3 rounded-full shadow-md text-base uppercase tracking-wider text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-resepku-orange hover:bg-orange-500"
          }`}
        >
          {isSubmitting ? "MEMPROSES..." : "MASUK"}
        </button>
      </form>

      {/* Register Section */}
      <div className="text-gray-400 text-xs mt-6 mb-2">
        Belum punya akun?
      </div>
      
      <a
        href="/register"
        onClick={goToRegister}
        className="block w-full py-3 rounded-full border-2 border-dotted border-gray-300 text-gray-600 font-bold hover:border-resepku-orange hover:text-resepku-orange no-underline cursor-pointer text-base"
      >
        Daftar
      </a>

      {/* Back to Home Link */}
      <div className="mt-5">
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