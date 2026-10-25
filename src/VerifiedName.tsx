type VerifiedIdentity = {
  displayName?: string
  username?: string
  isVerified?: boolean
}

type Props = {
  user?: VerifiedIdentity
  name?: string
  verified?: boolean
}

export default function VerifiedName({ user, name, verified }: Props) {
  const label = name ?? user?.displayName ?? ''
  const isVerified = user?.isVerified === true || verified === true || ['bikash', 'socialland'].includes(user?.username?.toLowerCase() || '')

  return <span className="verified-name" aria-label={isVerified ? `${label}, verified account` : undefined} title={isVerified ? 'Verified account' : undefined}>
    {label}
    {isVerified && <svg className="verified-badge-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.4 15 3.7l3.8-.2 1.3 3.6 3.3 1.9-1 3.7 1 3.7-3.3 1.9-1.3 3.6-3.8-.2-3 2.3-3-2.3-3.8.2-1.3-3.6-3.3-1.9 1-3.7-1-3.7 3.3-1.9 1.3-3.6 3.8.2L12 1.4Z" />
      <path d="m7.6 12.3 2.8 2.8 6.2-6.2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>}
  </span>
}
