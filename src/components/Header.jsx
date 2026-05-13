import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function Header({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <header style={{
      backgroundColor: 'var(--primary-blue)',
      color: 'white',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid var(--secondary-gold)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <img
          src="/cucei.png"
          alt="Logo CUCEI"
          style={{ height: 50, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <span style={{ fontWeight: 700, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>
          Market CUCEI
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ fontSize: 14 }}>¡Hola, {user.email?.split('@')[0]}!</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '5px 12px',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  )
}
