import { useState, useEffect } from 'react'
import { risorseService } from '../../services/risorseService'
import './RisorsaForm.css'

export const RisorsaForm = ({ risorsa, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (risorsa) {
      setFormData({
        nome: risorsa.nome || '',
      })
    }
  }, [risorsa])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        nome: formData.nome.trim(),
      }

      if (risorsa) {
        await risorseService.update(risorsa.id, dataToSave)
      } else {
        await risorseService.create(dataToSave)
      }

      onSave()
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="risorsa-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Nome Completo *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
          placeholder="Es: Mario Rossi"
          maxLength={255}
        />
        <small className="form-hint">Il nome deve essere univoco</small>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : risorsa ? 'Aggiorna' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

