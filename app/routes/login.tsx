import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router';

export default function Login() {
    const navigate = useNavigate();
    const [withPassword, setWithPassword] = useState(false);

    const onAction = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(formData.entries());
        console.log('login action', values, { withPassword });

        if (withPassword) {
            // Normal login with password
            return navigate('/');
        }

        // If not using password, go to verification code page
        return navigate('/verify');
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

                <button
                    type="submit"
                    className="bg-[#142D63] text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-8"
                >
                    {withPassword ? 'Entrar' : 'Siguiente'}
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