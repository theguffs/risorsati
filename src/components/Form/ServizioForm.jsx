import { useState, useEffect } from 'react'
import { serviziService } from '../../services/serviziService'
import './ServizioForm.css'

export const ServizioForm = ({ servizio, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    data: '',
    risorsa_id: '',
    risorsa_nome: '',
    ruolo_id: '',
    ruolo_nome: '',
    orario_inizio: '',
    orario_fine: '',
    paga: '',
    fee: '',
  })

  const [risorse, setRisorse] = useState([])
  const [ruoli, setRuoli] = useState([])
  const [ristoranti, setRistoranti] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (servizio) {
      setFormData({
        cliente: servizio.cliente || '',
        data: servizio.data || '',
        risorsa_id: servizio.risorsa_id || '',
        risorsa_nome: servizio.risorsa_nome || servizio.risorse?.nome || '',
        ruolo_id: servizio.ruolo_id || '',
        ruolo_nome: servizio.ruolo_nome || servizio.ruoli?.ruolo || '',
        orario_inizio: servizio.orario_inizio || '',
        orario_fine: servizio.orario_fine || '',
        paga: servizio.paga || '',
        fee: servizio.fee || '',
      })
    }
  }, [servizio])

  const handleSearchRisorse = async (query) => {
    if (query.length < 2) return
    try {
      const data = await serviziService.searchRisorse(query)
      setRisorse(data)
    } catch (err) {
      console.error('Errore ricerca risorse:', err)
    }
  }

  const handleSearchRuoli = async (query) => {
    if (query.length < 2) return
    try {
      const data = await serviziService.searchRuoli(query)
      setRuoli(data)
    } catch (err) {
      console.error('Errore ricerca ruoli:', err)
    }
  }

  const handleSearchRistoranti = async (query) => {
    if (query.length < 2) return
    try {
      const data = await serviziService.searchRistoranti(query)
      setRistoranti(data)
    } catch (err) {
      console.error('Errore ricerca ristoranti:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        ...formData,
        data: formData.data,
        orario_inizio: formData.orario_inizio || null,
        orario_fine: formData.orario_fine || null,
        paga: formData.paga ? parseFloat(formData.paga) : null,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        risorsa_id: formData.risorsa_id || null,
        ruolo_id: formData.ruolo_id || null,
      }

      if (servizio) {
        await serviziService.update(servizio.id, dataToSave)
      } else {
        await serviziService.create(dataToSave)
      }

      onSave()
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="servizio-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Cliente *</label>
        <input
          type="text"
          value={formData.cliente}
          onChange={(e) => {
            setFormData({ ...formData, cliente: e.target.value })
            handleSearchRistoranti(e.target.value)
          }}
          required
          list="ristoranti-list"
        />
        <datalist id="ristoranti-list">
          {ristoranti.map((r) => (
            <option key={r.id} value={r.nome}>
              {r.nome}
            </option>
          ))}
        </datalist>
      </div>

      <div className="form-group">
        <label>Data *</label>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Risorsa</label>
          <input
            type="text"
            value={formData.risorsa_nome}
            onChange={(e) => {
              setFormData({ ...formData, risorsa_nome: e.target.value, risorsa_id: '' })
              handleSearchRisorse(e.target.value)
            }}
            list="risorse-list"
            placeholder="Cerca risorsa..."
          />
          <datalist id="risorse-list">
            {risorse.map((r) => (
              <option key={r.id} value={r.nome} data-id={r.id}>
                {r.nome}
              </option>
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>Ruolo</label>
          <input
            type="text"
            value={formData.ruolo_nome}
            onChange={(e) => {
              setFormData({ ...formData, ruolo_nome: e.target.value, ruolo_id: '' })
              handleSearchRuoli(e.target.value)
            }}
            list="ruoli-list"
            placeholder="Cerca ruolo..."
          />
          <datalist id="ruoli-list">
            {ruoli.map((r) => (
              <option key={r.id} value={r.ruolo} data-id={r.id}>
                {r.ruolo}
              </option>
            ))}
          </datalist>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Orario Inizio</label>
          <input
            type="time"
            value={formData.orario_inizio}
            onChange={(e) => setFormData({ ...formData, orario_inizio: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Orario Fine</label>
          <input
            type="time"
            value={formData.orario_fine}
            onChange={(e) => setFormData({ ...formData, orario_fine: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Paga (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.paga}
            onChange={(e) => setFormData({ ...formData, paga: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Fee (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : servizio ? 'Aggiorna' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

