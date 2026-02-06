import React from 'react'
import { User as UserIcon } from 'lucide-react'

export default function ProfileHeader({ displayName, email }: { displayName?: string; email?: string }) {
  const initials = displayName ? displayName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : (email ? email[0].toUpperCase() : 'U')

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-700">{initials}</div>
      <div>
        <div className="text-xl font-semibold">{displayName || 'Usuario'}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2"><UserIcon className="w-4 h-4" />{email}</div>
      </div>
    </div>
  )
}
