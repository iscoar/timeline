import { useCallback, useState } from 'react'
import authService from '~/services/authService'
import useAuthStore from '~/store/authStore'

export function useProfile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (data: { full_name?: string; avatar_url?: string; [k: string]: any }) => {
    setLoading(true)
    setError(null)
    try {
      const { data: res, error } = await authService.updateUserProfile(data)
      if (error) {
        setError(String((error as Error).message || 'Error updating profile'))
        setLoading(false)
        return { success: false, error }
      }

      const updatedUser = (res as any)?.data?.user ?? (res as any)?.data?.session?.user ?? null
      if (updatedUser) useAuthStore.getState().setUser(updatedUser)
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(String((err as Error)?.message || 'Error'))
      setLoading(false)
      return { success: false, error: err }
    }
  }, [])

  const changePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      const email = user?.email
      if (!email) throw new Error('No email available')
      const { data, error } = await authService.changePassword(email, newPassword)
      if (error) {
        setError(String((error as Error).message || 'Error changing password'))
        setLoading(false)
        return { success: false, error }
      }
      const updatedUser = (data as any)?.data?.user ?? (data as any)?.data?.session?.user ?? null
      if (updatedUser) useAuthStore.getState().setUser(updatedUser)
      setLoading(false)
      return { success: true }
    } catch (err) {
      setError(String((err as Error)?.message || 'Error'))
      setLoading(false)
      return { success: false, error: err }
    }
  }, [user])

  return {
    user,
    loading,
    error,
    updateProfile,
    changePassword,
  }
}

export default useProfile
