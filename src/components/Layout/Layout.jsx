import { Sidebar } from './Sidebar'
import './Layout.css'

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}




