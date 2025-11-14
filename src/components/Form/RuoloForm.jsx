import { useState, useEffect } from 'react'
import { ruoliService } from '../../services/ruoliService'
import './RuoloForm.css'

export const RuoloForm = ({ ruolo, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    livello: '',
    ruolo: '',
    listino: '',
    fee_per_ora: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ruolo) {
      setFormData({
        livello: ruolo.livello || '',
        ruolo: ruolo.ruolo || '',
        listino: ruolo.listino || '',
        fee_per_ora: ruolo.fee_per_ora || '',
      })
    }
  }, [ruolo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        livello: parseInt(formData.livello),
        ruolo: formData.ruolo.trim(),
        listino: parseFloat(formData.listino) || 0,
        fee_per_ora: parseFloat(formData.fee_per_ora) || 0,
      }

      if (ruolo) {
        await ruoliService.update(ruolo.id, dataToSave)
      } else {
        await ruoliService.create(dataToSave)
      }

      onSave()
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ruolo-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Livello *</label>
        <input
          type="number"
          value={formData.livello}
          onChange={(e) => setFormData({ ...formData, livello: e.target.value })}
          required
          min="1"
          placeholder="Es: 1, 2, 3..."
        />
      </div>

      <div className="form-group">
        <label>Ruolo *</label>
        <input
          type="text"
          value={formData.ruolo}
          onChange={(e) => setFormData({ ...formData, ruolo: e.target.value })}
          required
          placeholder="Es: Cameriere, Chef, etc."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Listino (€) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.listino}
            onChange={(e) => setFormData({ ...formData, listino: e.target.value })}
            required
            min="0"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Fee per Ora (€) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.fee_per_ora}
            onChange={(e) => setFormData({ ...formData, fee_per_ora: e.target.value })}
            required
            min="0"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : ruolo ? 'Aggiorna' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

