import type { FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router';

export default function Register() {
  const navigate = useNavigate();

  const onRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    console.log('register', values);
    // Placeholder: perform registration then navigate
    navigate('/');
  };

  return (
    <div className="text-gray-800 flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
      <p className="text-center text-3xl">Crea tu cuenta.</p>
      <form className="flex flex-col pt-3 md:pt-8" onSubmit={onRegister}>
        <div className="flex flex-col pt-4">
          <label htmlFor="name" className="text-lg">Nombre</label>
          <input id="name" name="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="flex flex-col pt-4">
          <label htmlFor="email" className="text-lg">Correo</label>
          <input id="email" name="email" type="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="flex flex-col pt-4">
          <label htmlFor="password" className="text-lg">Contraseña</label>
          <input id="password" name="password" type="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="flex flex-col pt-4">
          <label htmlFor="confirm" className="text-lg">Confirmar contraseña</label>
          <input id="confirm" name="confirm" type="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <input type="submit" value="Registrarse" className="bg-[#142D63] text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-8" />
      </form>
      <div className="text-center pt-12 pb-12">
        <p>¿Ya tienes cuenta? <NavLink to="/login" className="underline font-semibold">Entrar.</NavLink></p>
      </div>
    </div>
  )
}
