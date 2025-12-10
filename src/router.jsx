import { createBrowserRouter, Navigate } from "react-router-dom";

// --- LAYOUTS ---
import GuestLayout from "./components/GuestLayout";
import DefaultLayout from "./components/DefaultLayout";
import MainLayoutSelector from "./components/MainLayoutSelector"; // Penentu Layout Otomatis

// --- VIEWS UMUM ---
import HomeGuest from "./views/HomeGuest"; 
import Login from "./views/login";
import Register from "./views/Register";
import Dashboard from "./views/Dashboard";
import ForgotPassword from "./views/ForgotPassword";
import VerifyCode from "./views/VerifyCode";
import ResetPassword from "./views/ResetPassword";

// --- VIEWS GUEST (MENU PUBLIK) ---
import MenuGuest from "./views/guest/MenuGuest";
import TipsGuest from "./views/guest/TipsGuest";
import KontakGuest from "./views/guest/KontakGuest";
import DetailResepGuest from "./views/guest/DetailResepGuest";
import RequestResepGuest from "./views/guest/RequestResepGuest";

// --- PERBAIKAN: Import File Baru (Bukan AboutGuest lagi) ---
import AboutStories from "./views/guest/AboutStories"; // Cerita Makanan
import AboutTeam from "./views/guest/AboutTeam";       // Profil Tim

// --- VIEWS ADMIN (CRUD) ---
import DashboardStats from "./views/admin/DashboardStats";
import RequestResep from "./views/admin/RequestResep";
import ListResep from "./views/admin/ListResep";
import ResepForm from "./views/admin/ResepForm";
import ListTips from "./views/admin/ListTips";
import TipsForm from "./views/admin/TipsForm";
import ListAbout from "./views/admin/ListAbout";
import AboutForm from "./views/admin/AboutForm";

const router = createBrowserRouter([
  
  // =========================================
  // 1. JALUR FLEKSIBEL (USER LOGIN / TAMU)
  // =========================================
  // Router akan mengecek apakah user login atau tidak via MainLayoutSelector
  {
    path: "/",
    element: <MainLayoutSelector />, 
    children: [
      // Landing Page
      { path: "/", element: <HomeGuest /> },        
      
      // Halaman Publik Lainnya
      { path: "/menu", element: <MenuGuest /> },    
      { path: "/resep/:id", element: <DetailResepGuest /> },
      { path: "/tips", element: <TipsGuest /> },    
      { path: "/kontak", element: <KontakGuest /> },

      // --- PERBAIKAN RUTE ABOUT ---
      { path: "/about", element: <AboutStories /> },    // Menu "ABOUT" (Makanan)
      { path: "/about-us", element: <AboutTeam /> },    // Footer "TENTANG KAMI" (Tim)

      // Request Resep (User)
      { path: "/request", element: <RequestResepGuest /> }, 
    ],
  },

  // =========================================
  // 2. JALUR KHUSUS TAMU (LOGIN / REGISTER)
  // =========================================
  // 2. GROUP AUTH
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      
      // Rute Lupa Password
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-code", element: <VerifyCode /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },

  // =========================================
  // 3. JALUR KHUSUS MEMBER & ADMIN (PROTECTED)
  // =========================================
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },

      // --- ADMIN ROUTES ---
      { path: "/admin-stats", element: <DashboardStats /> },
      { path: "/admin/request", element: <RequestResep /> },
      
      // CRUD Resep
      { path: "/admin/resep", element: <ListResep /> },
      { path: "/admin/resep/create", element: <ResepForm /> },
      { path: "/admin/resep/edit/:id", element: <ResepForm /> },

      // CRUD Tips
      { path: "/admin/tips", element: <ListTips /> },
      { path: "/admin/tips/create", element: <TipsForm /> },
      { path: "/admin/tips/edit/:id", element: <TipsForm /> },

      // CRUD About
      { path: "/admin/about", element: <ListAbout /> },
      { path: "/admin/about/create", element: <AboutForm /> },
      { path: "/admin/about/edit/:id", element: <AboutForm /> },
    ],
  },
]);

export default router;