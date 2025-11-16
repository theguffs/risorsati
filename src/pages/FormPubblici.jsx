import { useEffect, useState } from 'react'
import { formTokensService } from '../services/formTokensService'
import { supabase } from '../lib/supabase'
import './Page.css'
import './FormPubblici.css'

export const FormPubblici = () => {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    try {
      setLoading(true)
      const data = await formTokensService.getAll()
      setTokens(data)
    } catch (err) {
      setError('Errore nel caricamento dei token: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async () => {
    try {
      setError(null)
      const token = await formTokensService.create(newTokenName || null)
      setTokens([token, ...tokens])
      setNewTokenName('')
      setIsModalOpen(false)
      setSuccess('Token creato con successo!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError('Errore nella creazione del token: ' + err.message)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await formTokensService.update(id, { attivo: !currentStatus })
      loadTokens()
    } catch (err) {
      setError('Errore nell\'aggiornamento: ' + err.message)
    }
  }

  const handleRegenerateToken = async (id) => {
    if (!window.confirm('Sei sicuro di voler rigenerare questo token? Il vecchio token smetterà di funzionare.')) {
      return
    }
    try {
      await formTokensService.regenerate(id)
      loadTokens()
      setSuccess('Token rigenerato con successo!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError('Errore nella rigenerazione: ' + err.message)
    }
  }

  const handleDeleteToken = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo token?')) {
      return
    }
    try {
      await formTokensService.delete(id)
      loadTokens()
      setSuccess('Token eliminato con successo!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copiato negli appunti!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const getSupabaseUrl = () => {
    return import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Form Pubblici</h1>
        </div>
        <div className="dashboard-loading">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Form Pubblici</h1>
        <p>Gestisci i token per permettere ai Google Forms di inviare dati automaticamente</p>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Crea Nuovo Token
        </button>
      </div>

      <div className="tokens-list">
        {tokens.length === 0 ? (
          <div className="no-tokens">
            <p>Nessun token creato. Crea il tuo primo token per iniziare.</p>
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="token-card">
              <div className="token-header">
                <div>
                  <h3>{token.nome_form || 'Token senza nome'}</h3>
                  <span className={`token-status ${token.attivo ? 'active' : 'inactive'}`}>
                    {token.attivo ? '✓ Attivo' : '✗ Disattivato'}
                  </span>
                </div>
                <div className="token-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleActive(token.id, token.attivo)}
                    title={token.attivo ? 'Disattiva' : 'Attiva'}
                  >
                    {token.attivo ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleRegenerateToken(token.id)}
                    title="Rigenera token"
                  >
                    🔄
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteToken(token.id)}
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="token-info">
                <div className="info-row">
                  <label>Token API:</label>
                  <div className="token-value">
                    <code>{token.token}</code>
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(token.token)}
                      title="Copia token"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="info-row">
                  <label>URL Endpoint:</label>
                  <div className="token-value">
                    <code>{getSupabaseUrl()}/functions/v1/submit-form</code>
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(`${getSupabaseUrl()}/functions/v1/submit-form`)}
                      title="Copia URL"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="token-stats">
                  <div className="stat-item">
                    <span className="stat-label">Invii totali:</span>
                    <span className="stat-value">{token.total_submissions || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Ultimo utilizzo:</span>
                    <span className="stat-value">{formatDate(token.last_used_at)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Creato il:</span>
                    <span className="stat-value">{formatDate(token.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="token-instructions">
                <h4>Come usare questo token:</h4>
                <ol>
                  <li>Crea un Google Form con i campi necessari</li>
                  <li>Apri "Script editor" nel Google Form</li>
                  <li>Copia il template da <code>google-apps-script/template-form-submit.js</code></li>
                  <li>Incolla il token e l'URL endpoint nel codice</li>
                  <li>Crea un trigger "All'invio del modulo"</li>
                </ol>
                <p className="hint">
                  Vedi <code>google-apps-script/ISTRUZIONI_GOOGLE_FORMS.md</code> per istruzioni dettagliate.
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal per creare nuovo token */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crea Nuovo Token</h2>
            <div className="form-group">
              <label htmlFor="tokenName">Nome Form (opzionale):</label>
              <input
                id="tokenName"
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="Es. Form Ristorante X"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Annulla
              </button>
              <button className="btn btn-primary" onClick={handleCreateToken}>
                Crea Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

