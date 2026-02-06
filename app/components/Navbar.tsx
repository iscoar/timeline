import React from "react"
import { NavLink, useNavigate } from "react-router";
import useAuthStore from "~/store/authStore";
import authService from "~/services/authService";
import { User as UserIcon, LogOut as LogOutIcon, Mail as MailIcon, ChevronDown } from 'lucide-react'

export default function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await authService.signOut();
        } catch (err) {
            console.error('logout error', err);
        }
        useAuthStore.getState().clear();
        setLoading(false);
        navigate('/login');
    };

    const displayName = (user && ((user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.displayName)) || (user.name || (user as any).displayName))) || '';
    const email = user?.email || '';

    const initials = displayName
        ? displayName.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()
        : (email ? email[0].toUpperCase() : 'U');

    return (
        <nav className="bg-[#142D63] border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <NavLink to="/" className="text-xl font-bold text-white">Timeline</NavLink>

                    <div className="hidden md:flex items-center space-x-6">
                        <NavLink to="/" className="text-gray-100 hover:text-white">Home</NavLink>

                        {!user && (
                            <>
                                <NavLink to="/login" className="text-gray-100 hover:text-white">Login</NavLink>
                                <NavLink to="/register" className="text-gray-100 hover:text-white">Registro</NavLink>
                            </>
                        )}

                        {user && (
                            <div className="relative" ref={containerRef}>
                                <button
                                    onClick={() => setOpen(o => !o)}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md"
                                    aria-haspopup="true"
                                    aria-expanded={open}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white text-[#142D63] flex items-center justify-center font-semibold">{initials}</div>
                                    <span className="hidden sm:inline-block text-sm">{displayName || email}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {open && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded shadow-lg z-99">
                                        <div className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-medium text-sm">{displayName || 'Usuario'}</div>
                                                    <div className="text-xs text-gray-500 truncate flex items-center gap-1"><MailIcon className="w-3 h-3" />{email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t" />
                                        <div className="py-1">
                                            <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                                <UserIcon className="w-4 h-4 text-gray-600" />
                                                Mi perfil
                                            </NavLink>
                                            <button onClick={handleLogout} disabled={loading} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                                <LogOutIcon className="w-4 h-4 text-gray-600" />
                                                {loading ? 'Saliendo...' : 'Cerrar sesión'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button className="p-2 rounded-md text-gray-500 hover:text-gray-700">Menu</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
