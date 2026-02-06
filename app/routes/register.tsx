import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import authService from '~/services/authService';
import useAuthStore from '~/store/authStore';

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const onChangeConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmed = e.target.value;
        setConfirm(confirmed);
        if (confirmed.length > 0 && password !== confirmed) return setMsg('Las contraseñas no coinciden');
        setMsg('');
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg('');
        if (password !== confirm) return setMsg('Las contraseñas no coinciden');

        setLoading(true);
        try {
            const { data, error } = await authService.signUp(email, password, { full_name: name });
            setLoading(false);
            if (error) {
                console.error('signup error', error);
                return setMsg(String((error && (error as Error).message) || 'Error al registrar usuario'));
            }

            const user = data?.data?.user ?? data?.data?.session?.user ?? null;
            useAuthStore.getState().setUser(user);
            useAuthStore.getState().setPendingEmail(null);
            setLoading(false);
            navigate('/');
        } catch (err) {
            setLoading(false);
            setMsg(String((err && (err as Error).message) || 'Error inesperado'));
        }
    };

    return (
        <div className="text-gray-800 flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
            <p className="text-center text-3xl">Crea tu cuenta.</p>
            <form className="flex flex-col pt-3 md:pt-8" onSubmit={onSubmit}>
                <div className="flex flex-col pt-4">
                    <label htmlFor="name" className="text-lg">Nombre</label>
                    <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
                </div>

                <div className="flex flex-col pt-4">
                    <label htmlFor="email" className="text-lg">Correo</label>
                    <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
                </div>

                <div className="flex flex-col pt-4">
                    <label htmlFor="password" className="text-lg">Contraseña</label>
                    <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
                </div>

                <div className="flex flex-col pt-4">
                    <label htmlFor="confirm" className="text-lg">Confirmar contraseña</label>
                    <input id="confirm" name="confirm" type="password" value={confirm} onChange={onChangeConfirm} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
                </div>

                {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}

                <button disabled={loading || !!msg} type="submit" className="bg-[#142D63] text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-8">
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
            <div className="text-center pt-12 pb-12">
                <p>¿Ya tienes cuenta? <NavLink to="/login" className="underline font-semibold">Entrar.</NavLink></p>
            </div>
        </div>
    );
}
