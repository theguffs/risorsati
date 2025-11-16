import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FormPubbliciSection } from '../components/FormPubblici/FormPubbliciSection'
import './Page.css'
import './Profilo.css'

export const Profilo = () => {
  const { user, updatePassword, signIn } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validazione
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Tutti i campi sono obbligatori')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('La nuova password deve essere diversa dalla password corrente')
      return
    }

    try {
      setLoading(true)
      
      // Verifica che la password corrente sia corretta
      // Tentiamo un login con la password corrente per verificarla
      try {
        await signIn(user.email, formData.currentPassword)
      } catch (authError) {
        // Se il login fallisce, la password corrente non è corretta
        setError('Password corrente non corretta')
        setLoading(false)
        return
      }

      // Se la password corrente è corretta, procedi con il cambio
      await updatePassword(formData.newPassword)
      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      // Se l'errore non è già stato gestito sopra, mostra l'errore generico
      if (err.message !== 'Password corrente non corretta') {
        setError(err.message || 'Errore durante il cambio password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profilo</h1>
        <p>Gestisci le impostazioni del tuo account</p>
      </div>

      <div className="profilo-container">
        <div className="profilo-section">
          <h2>Informazioni Account</h2>
          <div className="profilo-info">
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="profilo-section">
          <h2>Cambia Password</h2>
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
          {success && (
            <div className="form-success">
              Password cambiata con successo!
            </div>
          )}
          <form onSubmit={handleSubmit} className="profilo-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Password Corrente *</label>
              <input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Inserisci la password corrente"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nuova Password *</label>
              <input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Inserisci la nuova password (min. 6 caratteri)"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Nuova Password *</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Conferma la nuova password"
                required
                minLength={6}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvataggio...' : 'Cambia Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="profilo-section">
          <FormPubbliciSection />
        </div>
      </div>
    </div>
  )
}

