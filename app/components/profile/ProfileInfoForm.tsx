import React, { useState } from 'react'
import useProfile from '~/hooks/useProfile'

export default function ProfileInfoForm() {
  const { user, updateProfile, loading, error } = useProfile()
  const [name, setName] = useState(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? (user as any)?.name ?? '')
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const onSave = async () => {
    setSaving(true)
    setMsg('')
    const res = await updateProfile({ full_name: name, avatar_url: avatar })
    if (res.success) setMsg('Perfil actualizado')
    else setMsg('Error al actualizar')
    setSaving(false)
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Editar información</h3>
      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Nombre público</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Avatar URL</span>
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <div className="flex items-center gap-3">
          <button disabled={saving} onClick={onSave} className="bg-[#142D63] text-white px-4 py-2 rounded">{saving ? 'Guardando...' : 'Guardar'}</button>
          {msg && <div className="text-sm text-gray-600">{msg}</div>}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </section>
  )
}
