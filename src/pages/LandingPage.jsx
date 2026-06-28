import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block border border-primary/20">
            Platform Resmi Polinela
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Sistem Pelaporan <br className="hidden md:block" />
            <span className="text-primary">Barang Hilang</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Kehilangan barang berharga di area kampus? Jangan panik. Laporkan segera dan bantu kembalikan barang temuan kepada pemiliknya.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/items/lost" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
              <Search size={20} />
              Cari Barang Hilang
            </Link>
            <Link to="/items/found" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Package size={20} />
              Laporkan Temuan
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats/Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Search className="w-10 h-10 text-primary" />}
            title="Pencarian Cepat"
            description="Temukan barang Anda yang hilang dengan fitur pencarian dan filter yang akurat berdasarkan kategori."
            delay={0.1}
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-10 h-10 text-primary" />}
            title="Aman & Terverifikasi"
            description="Proses klaim barang terintegrasi dengan validasi admin keamanan untuk mencegah penipuan."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Clock className="w-10 h-10 text-primary" />}
            title="Update Realtime"
            description="Dapatkan notifikasi langsung ketika barang Anda ditemukan atau klaim Anda disetujui."
            delay={0.3}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-10">
        <div className="bg-card border border-border rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mari Saling Membantu</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Satu laporan kecil dari Anda bisa sangat berarti bagi mereka yang kehilangan. Bergabunglah dengan komunitas Polinela yang peduli.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors">
              Daftar Sekarang <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="hidden md:flex flex-col gap-4 w-full max-w-sm">
            {/* Mockup cards simulating recent finds */}
            <div className="bg-background p-4 rounded-xl shadow-sm border border-border transform rotate-2 hover:rotate-0 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">A</div>
                <div>
                  <p className="text-sm font-semibold">Dompet Hitam</p>
                  <p className="text-xs text-muted-foreground">Ditemukan di Gedung Kuliah Bersama</p>
                </div>
              </div>
            </div>
            <div className="bg-background p-4 rounded-xl shadow-sm border border-border transform -rotate-1 hover:rotate-0 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-secondary-foreground font-bold">B</div>
                <div>
                  <p className="text-sm font-semibold">Kunci Motor Honda</p>
                  <p className="text-xs text-muted-foreground">Ditemukan di Parkiran Terpadu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border border-border p-8 rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all group"
    >
      <div className="mb-6 inline-flex p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
