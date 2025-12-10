import { useEffect } from "react";

export default function AboutTeam() {
  // Data Anggota Tim (Hardcode)
  const teamMembers = [
    { name: "Rafi Ghani Alghifari", role: "Project Manager", desc: "Mengkoordinasikan seluruh tim, mengatur jadwal, dan memastikan visi Resepku tercapai dengan sempurna.", image: "/gambar/Rafi Ghani.png" },
    { name: "Khalda Rahadatul Azima", role: "System Architecture", desc: "Merancang struktur database yang efisien dan arsitektur sistem yang skalabel serta aman.", image: "/gambar/Khalda Rahadatul.png" },
    { name: "Ghina Gaitsa", role: "UI/UX Designer", desc: "Mendesain antarmuka yang estetis dan pengalaman pengguna (user experience) yang nyaman.", image: "/gambar/Ghina Gaitsa.png" },
    { name: "Andri Muhammad Arief", role: "Backend Developer", desc: "Mengembangkan logika server, API, dan fungsi-fungsi inti agar aplikasi berjalan lancar.", image: "/gambar/Andri Arief.png" },
    { name: "Naela Amira Najwa", role: "Frontend Developer", desc: "Mengimplementasikan desain menjadi kode yang interaktif dan responsif di browser Anda.", image: "/gambar/Naela Amira.png" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-montserrat animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-[#333] mb-4 font-serif">TIM DI BALIK RESEPKU</h1>
        <p className="text-gray-500 text-lg">Kami adalah tim solid yang bekerja sama membangun pengalaman kuliner digital terbaik.</p>
        <div className="w-24 h-1 bg-[#e6a357] mx-auto mt-6 rounded-full"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {teamMembers.map((member, index) => (
            <div key={index} className="bg-white w-80 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 transition duration-300 border-b-4 border-[#e6a357]">
                <div className="bg-gray-50 py-8 border-b border-gray-100 flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#e6a357] p-1 bg-white shadow-sm">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                    </div>
                </div>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-[#333] mb-1 font-serif">{member.name}</h3>
                    <span className="inline-block bg-orange-100 text-[#e6a357] text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-wider">{member.role}</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.desc}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}