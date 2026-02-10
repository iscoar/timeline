import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router';
import authService from '~/services/authService';
import useAuthStore from '~/store/authStore';

export default function Login() {
    const navigate = useNavigate();
    const [withPassword, setWithPassword] = useState(true);

    const setPendingEmail = useAuthStore((s: any) => s.setPendingEmail);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onAction = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(formData.entries()) as { email?: string; password?: string };
        const email = String(values.email || '');

        try {
            if (withPassword) {
                // Normal login with password via Supabase
                const { data, error } = await authService.signInWithPassword(email, String(values.password || ''));
                if (error) {
                    console.error('login error', error);
                    setError(String((error && (error as Error).message) || 'Error al iniciar sesión'));
                    setLoading(false);
                    return;
                }
                // If successful, store user (response shape varies between SDK versions)
                const user = data?.data?.user ?? data?.data?.session?.user ?? null;
                useAuthStore.getState().setUser(user);
                setLoading(false);
                return navigate('/');
            }

            // If not using password, send OTP and save pending email
            const { data, error } = await authService.sendOtp(email);
            if (error) {
                console.error('send otp error', error);
                setError(String((error && (error as Error).message) || 'Error al enviar código'));
                setLoading(false);
                return;
            }
            setPendingEmail(email);
            setLoading(false);
            return navigate('/verify');
        } catch (err) {
            setError(String((err && (err as Error).message) || 'Error inesperado'));
            setLoading(false);
        }
    }

    return (
        <div className="text-gray-800 flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
            <p className="text-center text-3xl">Bienvenido.</p>
            <form className="flex flex-col pt-3 md:pt-8" onSubmit={onAction}>
                <div className="flex flex-col pt-4">
                    <label htmlFor="email" className="text-lg">Correo</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                {withPassword && (
                    <div className="flex flex-col pt-4">
                        <label htmlFor="password" className="text-lg">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <button
                    disabled={loading}
                    type="submit"
                    className="bg-[#142D63] text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-8"
                >
                    {loading ? 'Enviando...' : withPassword ? 'Entrar' : 'Siguiente'}
                </button>
            </form>

            <div className="text-center pt-4">
                <button
                    type="button"
                    onClick={() => setWithPassword((s) => !s)}
                    className="text-sm text-[#142D63] underline"
                >
                    {withPassword ? 'Entrar con código' : 'Entrar con contraseña'}
                </button>
            </div>

            <div className="text-center pt-12 pb-12">
                <p>¿No tienes cuenta? <NavLink to="/register" className="underline font-semibold">Regístrate.</NavLink></p>
            </div>
        </div>
    );
}