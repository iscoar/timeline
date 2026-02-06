import ProfileHeader from '~/components/profile/ProfileHeader'
import ProfileInfoForm from '~/components/profile/ProfileInfoForm'
import PasswordForm from '~/components/profile/PasswordForm'
import useProfile from '~/hooks/useProfile'

export default function Profile() {
  const { user } = useProfile()

  if (!user) return null

  const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? (user as any).name
  const email = user.email

  return (
    <div className="p-8 text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <ProfileHeader displayName={displayName} email={email} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileInfoForm />
        <PasswordForm />
      </div>
    </div>
  )
}
