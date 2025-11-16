import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Sidebar.css'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/servizi', label: 'Servizi', icon: '📅' },
  { path: '/fissi', label: 'Fissi', icon: '📌' },
  { path: '/risorse', label: 'Risorse', icon: '👥' },
  { path: '/ristoranti', label: 'Ristoranti', icon: '🍽️' },
  { path: '/ruoli', label: 'Ruoli', icon: '💼' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Gestio</h2>
        <p>Gestione Risorse</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {user && (
          <>
            <Link
              to="/profilo"
              className={`sidebar-profile-link ${location.pathname === '/profilo' ? 'active' : ''}`}
            >
              👤 Profilo
            </Link>
            <div className="user-info">
              <div className="user-email">{user.email}</div>
              <button onClick={handleLogout} className="btn-logout">
                🚪 Esci
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}




