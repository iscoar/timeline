import React, { useState } from 'react'
import useProfile from '~/hooks/useProfile'

export default function PasswordForm() {
    const { user, changePassword } = useProfile()
    const [newPass, setNewPass] = useState('')
    const [confirm, setConfirm] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const onChangeConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmed = e.target.value;
        setConfirm(confirmed)
        if (confirmed.length > 0 && (newPass !== confirmed)) return setMsg('Las contraseñas no coinciden')
        setMsg('')
    }

    const onChange = async () => {
        setMsg('')
        if (newPass !== confirm) return setMsg('Las contraseñas no coinciden')
        setLoading(true)
        const res = await changePassword(newPass)
        setLoading(false)
        if (res.success) setMsg('Contraseña actualizada')
        else setMsg('Error al actualizar contraseña')
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Contraseña</h3>
            <div className="grid gap-4">
                <label className="flex flex-col">
                    <span className="text-sm text-gray-600">Nueva contraseña</span>
                    <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="mt-1 p-2 border rounded" />
                </label>
                <label className="flex flex-col">
                    <span className="text-sm text-gray-600">Confirmar contraseña</span>
                    <input type="password" value={confirm} onChange={onChangeConfirm} className="mt-1 p-2 border rounded" />
                </label>

                <div>
                    <button onClick={onChange} disabled={loading} className="bg-[#142D63] text-white px-4 py-2 rounded">{loading ? 'Guardando...' : 'Establecer contraseña'}</button>
                </div>
            </div>

            {msg && <div className="mt-3 text-sm text-gray-600">{msg}</div>}
        </section>
    )
}
