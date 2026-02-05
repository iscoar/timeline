import React from 'react';
import { useNavigate } from 'react-router';
import useVerificationCode from '~/hooks/useVerificationCode';
import authService from '~/services/authService';
import useAuthStore from '~/store/authStore';

export default function VerifyCode() {
  const navigate = useNavigate();
  const { pendingEmail } = useAuthStore();
  const hook = useVerificationCode({ length: 6 });
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const code = hook.getCode();
    const email = pendingEmail;
    if (!email) {
      hook.reset();
      setErrorMsg('Email no encontrado. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await authService.verifyCode(email, code);
      if (error) {
        console.error('verify error', error);
        setErrorMsg(String((error && (error as Error).message) || 'Código inválido'));
        hook.reset();
        setLoading(false);
        return;
      }

      const user = data?.data?.user ?? data?.data?.session?.user ?? null;
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setPendingEmail(null);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setErrorMsg(String((err && (err as Error).message) || 'Error inesperado'));
      hook.reset();
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-800 flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
      <p className="text-center text-3xl">Verificación</p>
      <p className="text-center text-sm text-gray-600 mt-2">Introduce el código de 6 dígitos enviado a tu correo.</p>

      <form className="flex flex-col pt-6 items-center" onSubmit={onSubmit}>
        <div className="flex gap-2">
          {hook.values.map((v, i) => (
            <input
              key={i}
              ref={(el) => hook.setRef(el, i)}
              value={v}
              onChange={(e) => hook.handleChange(e.target.value, i)}
              onKeyDown={(e) => hook.handleKeyDown(e.key, i)}
              onPaste={i === 0 ? (e) => { e.preventDefault(); hook.handlePaste(e.clipboardData.getData('text')); } : undefined}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className="w-12 h-12 text-center border rounded text-lg"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {(hook.error || errorMsg) && <p className="text-sm text-red-600 mt-2">{errorMsg || hook.error}</p>}

        <button disabled={loading} className="bg-[#142D63] disabled:opacity-60 text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-6 w-full">
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      <div className="text-center pt-6">
        <button className="text-sm underline text-[#142D63]" onClick={() => {/* resend placeholder */}}>Reenviar código</button>
      </div>
    </div>
  )
}
