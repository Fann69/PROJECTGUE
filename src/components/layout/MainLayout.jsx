import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-card border-t border-border mt-auto py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Sistem Pelaporan Barang Hilang - Polinela</p>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}
