import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, LogOut, User, Menu, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">FoundIt!</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/items/lost" className="text-muted-foreground hover:text-primary transition-colors">Barang Hilang</Link>
            <Link to="/items/found" className="text-muted-foreground hover:text-primary transition-colors">Barang Ditemukan</Link>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-border pl-4">
                <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary">
                    {profile?.foto ? (
                      <img src={profile.foto} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span>{profile?.nama || 'User'}</span>
                </Link>
                <Link to="/profile" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Profil">
                  <User size={20} />
                </Link>
                <button onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">Masuk</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">Daftar</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link to="/items/lost" className="px-2 py-1 text-foreground" onClick={() => setIsOpen(false)}>Barang Hilang</Link>
            <Link to="/items/found" className="px-2 py-1 text-foreground" onClick={() => setIsOpen(false)}>Barang Ditemukan</Link>
            
            <hr className="border-border" />
            
            {user ? (
              <>
                <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} className="px-2 py-1 text-foreground" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="text-left px-2 py-1 text-destructive">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="px-4 py-2 text-center text-sm font-medium border border-border rounded-md" onClick={() => setIsOpen(false)}>Masuk</Link>
                <Link to="/register" className="px-4 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-md" onClick={() => setIsOpen(false)}>Daftar</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
