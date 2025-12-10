export default function KontakGuest() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in-up">
      <h1 className="text-4xl font-black text-[#333] mb-4 font-serif">BUTUH BANTUAN?</h1>
      <p className="text-gray-500 mb-16 max-w-2xl mx-auto">
        Dengan senang hati tim kami akan membantu menyelesaikan kendala Anda, hubungi kami melalui informasi kontak dibawah ini.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom 1: Visit */}
        <div className="p-6">
            <i className="fas fa-home text-5xl text-[#e6a357] mb-4"></i>
            <h3 className="text-xl font-bold text-[#333] mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                Jl. Dr. Mohammad Hatta, Limau Manis, Kec. Pauh, Kota Padang,<br />Sumatera Barat 25175
            </p>
        </div>

        {/* Kolom 2: Email */}
        <div className="p-6 border-l border-r border-gray-200">
            <i className="fas fa-envelope text-5xl text-[#e6a357] mb-4"></i>
            <h3 className="text-xl font-bold text-[#333] mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm">
                Hubungi kami melalui email<br />
                <a href="mailto:resepku@gmail.com" className="text-[#e74c3c] font-bold hover:underline">resepku@gmail.com</a>
            </p>
        </div>

        {/* Kolom 3: Call */}
        <div className="p-6">
            <i className="fas fa-phone-alt text-5xl text-[#e6a357] mb-4"></i>
            <h3 className="text-xl font-bold text-[#333] mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm">
                Hubungi kami melalui kontak<br />
                <a href="tel:+6282174738177" className="text-[#e74c3c] font-bold hover:underline">+62 8217-4738-177</a>
            </p>
        </div>

      </div>
    </div>
  );
}