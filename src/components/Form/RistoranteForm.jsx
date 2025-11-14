import { useState, useEffect } from 'react'
import { ristorantiService } from '../../services/ristorantiService'
import './RistoranteForm.css'

export const RistoranteForm = ({ ristorante, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ristorante) {
      setFormData({
        nome: ristorante.nome || '',
      })
    }
  }, [ristorante])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        nome: formData.nome.trim(),
      }

      if (ristorante) {
        await ristorantiService.update(ristorante.id, dataToSave)
      } else {
        await ristorantiService.create(dataToSave)
      }

      onSave()
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ristorante-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Nome Ristorante *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
          placeholder="Es: Ristorante XYZ"
          maxLength={255}
        />
        <small className="form-hint">Il nome deve essere univoco</small>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : ristorante ? 'Aggiorna' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

