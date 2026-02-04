import React from 'react';
import { useNavigate } from 'react-router';
import useVerificationCode from '~/hooks/useVerificationCode';

export default function VerifyCode() {
  const navigate = useNavigate();
  const hook = useVerificationCode({ length: 6, onSuccess: () => navigate('/') });

  return (
    <div className="text-gray-800 flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
      <p className="text-center text-3xl">Verificación</p>
      <p className="text-center text-sm text-gray-600 mt-2">Introduce el código de 6 dígitos enviado a tu correo.</p>

      <form className="flex flex-col pt-6 items-center" onSubmit={(e) => { e.preventDefault(); hook.submit(); }}>
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

        {hook.error && <p className="text-sm text-red-600 mt-2">{hook.error}</p>}

        <button className="bg-[#142D63] text-white font-bold text-lg hover:bg-[#142D63]/80 p-2 mt-6 w-full">Verificar</button>
      </form>

      <div className="text-center pt-6">
        <button className="text-sm underline text-[#142D63]" onClick={() => {/* resend placeholder */}}>Reenviar código</button>
      </div>
    </div>
  )
}
