import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout() {
  const { token } = useStateContext();

  // Jika sudah login, jangan boleh masuk sini, lempar ke dashboard
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-montserrat relative">
      
      {/* BACKGROUND IMAGE FULL SCREEN */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/gambar/login.jpg')", // Pastikan file ini ada di public/gambar
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay Putih Tipis (Supaya form lebih kontras) */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
      </div>

      {/* AREA FORM (KOTAK TENGAH) */}
      <div className="relative z-10 w-full max-w-[500px]">
        <Outlet />
      </div>
      
    </div>
  );
}