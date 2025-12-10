import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// --- 1. REGISTRASI CHART.JS (WAJIB ADA) ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardStats() {
  
  const [stats, setStats] = useState({
    total_today: 0,
    total_month: 0,
    chart_labels: [],
    chart_data: []
  });
  const [loading, setLoading] = useState(true);
  // serverTimeSeconds keeps seconds since midnight according to server WIB clock
  const [serverTimeSeconds, setServerTimeSeconds] = useState(null);

  // Tick server time every second — will be initialized after API call
  useEffect(() => {
    if (serverTimeSeconds === null) return;
    const timer = setInterval(() => {
      setServerTimeSeconds((s) => (s + 1) % 86400);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverTimeSeconds]);

  // Fetch Data (combined counts — members + guests)
  useEffect(() => {
    setLoading(true);
    axiosClient.get('/admin/dashboard-stats')
      .then(({ data }) => {
        setStats(data);
        if (data.server_time) {
          // parse HH:mm:ss into seconds since midnight
          const parts = data.server_time.split(':').map(p => parseInt(p, 10));
          if (parts.length === 3) {
            const s = parts[0] * 3600 + parts[1] * 60 + parts[2];
            setServerTimeSeconds(s);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Config Grafik
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
        y: { beginAtZero: true, suggestedMax: 5, ticks: { precision: 0 } },
        x: { grid: { display: false } }
    }
  };

  const dataChart = {
    labels: stats.chart_labels,
    datasets: [{
        label: 'Pengunjung',
        data: stats.chart_data,
        backgroundColor: 'rgba(230, 163, 87, 0.7)',
        borderRadius: 4,
    }],
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--:--';
    const h = Math.floor(seconds / 3600) % 24;
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-montserrat animate-fade-in-up">
        
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-end mb-8 pb-4 border-b border-gray-200">
        <div>
            <h1 className="text-3xl font-black text-resepku-dark flex items-center gap-3 mb-1">
                <i className="fas fa-chart-line text-resepku-orange"></i> 
                Dashboard Eksekutif
            </h1>
            <p className="text-gray-500 font-medium text-sm">Laporan performa website & statistik pengunjung.</p>
        </div>
        <div className="text-right">
            <h2 className="text-5xl font-mono font-bold text-resepku-orange tracking-tighter">
            {formatTime(serverTimeSeconds)}
          </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">WIB</span>
        </div>
      </div>

      {/* GRAFIK UTAMA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
         <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-bold text-resepku-dark text-lg">Tren Kunjungan (7 Hari Terakhir)</h3>
            <div className="flex items-center gap-4">
              {/* Combined visitors view */}
              <div className="px-3 py-1 bg-white rounded-lg shadow-sm text-sm font-bold">Semua</div>
                <div className="flex gap-4 text-sm items-center">
                <span className="px-3 py-1 bg-orange-50 text-resepku-orange rounded-lg font-bold">
                  Total Hari Ini ({stats.today_label || ''}): {stats.total_today} Pengunjung
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold">
                  Bulan Ini: {stats.total_month}
                </span>
                </div>
            </div>
          </div>
         
         <div className="h-80 w-full">
            {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Memuat data...</div>
            ) : (
                <Bar options={options} data={dataChart} />
            )}
         </div>
      </div>

      {/* KARTU ESTIMASI BIAYA (Manual) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-resepku-brown">
        <h2 className="text-2xl font-bold text-resepku-brown mb-8 flex items-center gap-3">
            <i className="fas fa-file-invoice-dollar bg-resepku-brown text-white p-2 rounded-lg text-lg"></i> 
            Estimasi Biaya Proyek
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kartu Waktu */}
            <div className="flex items-center gap-6 p-6 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-200">
                    <i className="fas fa-hourglass-half"></i>
                </div>
                <div>
                    <h3 className="text-purple-900/60 font-bold text-xs uppercase tracking-widest mb-1">Estimasi Waktu</h3>
                    <p className="text-3xl font-black text-purple-900">1.5 <span className="text-lg font-medium text-purple-400">Bulan</span></p>
                </div>
            </div>

            {/* Kartu Harga */}
            <div className="flex items-center gap-6 p-6 rounded-xl bg-green-50 border border-green-100">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200">
                    <i className="fas fa-tags"></i>
                </div>
                <div>
                    <h3 className="text-green-900/60 font-bold text-xs uppercase tracking-widest mb-1">Harga Software</h3>
                    <p className="text-3xl font-black text-green-900">Rp 1.500.000</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}