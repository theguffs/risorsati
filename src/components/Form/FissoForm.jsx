import { useState, useEffect } from 'react'
import { fissiService } from '../../services/fissiService'
import { AutocompleteDropdown } from './AutocompleteDropdown'
import './ServizioForm.css'

export const FissoForm = ({ fisso, mese, anno, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    data: '',
    risorsa_id: '',
    risorsa_nome: '',
    ruolo_id: '',
    ruolo_nome: '',
    orari_diurni: '',
    orari_serali: '',
    colloquio: false,
    prova: false,
    assunzione: false,
    fee: '',
  })

  const [risorse, setRisorse] = useState([])
  const [ruoli, setRuoli] = useState([])
  const [ristoranti, setRistoranti] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Se viene passato mese/anno, imposta la data al primo giorno del mese
    if (mese && anno && !fisso) {
      const dataMese = new Date(anno, mese - 1, 1)
      setFormData(prev => ({
        ...prev,
        data: dataMese.toISOString().split('T')[0],
      }))
    }

    if (fisso) {
      setFormData({
        cliente: fisso.cliente || '',
        data: fisso.data || '',
        risorsa_id: fisso.risorsa_id || '',
        risorsa_nome: fisso.risorsa_nome || fisso.risorse?.nome || '',
        ruolo_id: fisso.ruolo_id || '',
        ruolo_nome: fisso.ruolo_nome || fisso.ruoli?.ruolo || '',
        orari_diurni: fisso.orari_diurni || '',
        orari_serali: fisso.orari_serali || '',
        colloquio: fisso.colloquio || false,
        prova: fisso.prova || false,
        assunzione: fisso.assunzione || false,
        fee: fisso.fee || '',
      })
    }
  }, [fisso, mese, anno])

  const handleSearchRisorse = async (query) => {
    // Se il campo è vuoto, carica tutte le risorse
    if (!query || query.length === 0) {
      try {
        const data = await fissiService.getAllRisorse()
        setRisorse(data)
      } catch (err) {
        console.error('Errore caricamento risorse:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
    try {
      const data = await fissiService.searchRisorse(query)
      setRisorse(data)
    } catch (err) {
      console.error('Errore ricerca risorse:', err)
    }
  }

  const handleSearchRuoli = async (query) => {
    // Se il campo è vuoto, carica tutti i ruoli
    if (!query || query.length === 0) {
      try {
        const data = await fissiService.getAllRuoli()
        setRuoli(data)
      } catch (err) {
        console.error('Errore caricamento ruoli:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
    try {
      const data = await fissiService.searchRuoli(query)
      setRuoli(data)
    } catch (err) {
      console.error('Errore ricerca ruoli:', err)
    }
  }

  const handleSearchRistoranti = async (query) => {
    // Se il campo è vuoto, carica tutti i ristoranti
    if (!query || query.length === 0) {
      try {
        const data = await fissiService.getAllRistoranti()
        setRistoranti(data)
      } catch (err) {
        console.error('Errore caricamento ristoranti:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
    try {
      const data = await fissiService.searchRistoranti(query)
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
      // Se risorsa_nome è presente ma risorsa_id no, cerca l'ID
      let risorsaId = formData.risorsa_id
      if (!risorsaId && formData.risorsa_nome) {
        const risorsaTrovata = risorse.find(r => r.nome === formData.risorsa_nome)
        if (risorsaTrovata) {
          risorsaId = risorsaTrovata.id
        }
      }

      // Se ruolo_nome è presente ma ruolo_id no, cerca l'ID
      let ruoloId = formData.ruolo_id
      if (!ruoloId && formData.ruolo_nome) {
        const ruoloTrovato = ruoli.find(r => r.ruolo === formData.ruolo_nome)
        if (ruoloTrovato) {
          ruoloId = ruoloTrovato.id
        }
      }

      const dataToSave = {
        cliente: formData.cliente,
        data: formData.data,
        orari_diurni: formData.orari_diurni || null,
        orari_serali: formData.orari_serali || null,
        colloquio: formData.colloquio,
        prova: formData.prova,
        assunzione: formData.assunzione,
        fee: formData.fee ? parseFloat(formData.fee) : 0,
        risorsa_id: risorsaId || null,
        risorsa_nome: formData.risorsa_nome || null,
        ruolo_id: ruoloId || null,
        ruolo_nome: formData.ruolo_nome || null,
      }

      if (fisso) {
        await fissiService.update(fisso.id, dataToSave)
      } else {
        await fissiService.create(dataToSave)
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
        <AutocompleteDropdown
          label="Cliente *"
          value={formData.cliente}
          onChange={(value) => {
            setFormData({ ...formData, cliente: value })
            handleSearchRistoranti(value)
          }}
          onFocus={() => {
            // Carica tutti i ristoranti quando si mette il focus se il campo è vuoto
            if (!formData.cliente) {
              handleSearchRistoranti('')
            }
          }}
          onSelect={(ristorante) => {
            setFormData({ ...formData, cliente: ristorante.nome })
          }}
          options={ristoranti}
          placeholder="Cerca o seleziona cliente..."
          displayKey="nome"
          searchOnFocus={true}
          required={true}
        />
      </div>

      <div className="form-group">
        <label>Data *</label>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          required
        />
        <span className="form-hint">Usa il primo giorno del mese (es. 01/11/2025 per novembre 2025)</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <AutocompleteDropdown
            label="Risorsa"
            value={formData.risorsa_nome}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, risorsa_nome: value, risorsa_id: '' }))
              handleSearchRisorse(value)
            }}
            onFocus={() => {
              // Carica tutte le risorse quando si mette il focus se il campo è vuoto
              if (!formData.risorsa_nome) {
                handleSearchRisorse('')
              }
            }}
            onSelect={(risorsa) => {
              setFormData(prev => ({
                ...prev,
                risorsa_id: risorsa.id,
                risorsa_nome: risorsa.nome,
              }))
            }}
            options={risorse}
            placeholder="Cerca o seleziona risorsa..."
            displayKey="nome"
            searchOnFocus={true}
          />
        </div>

        <div className="form-group">
          <AutocompleteDropdown
            label="Ruolo"
            value={formData.ruolo_nome}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, ruolo_nome: value, ruolo_id: '' }))
              handleSearchRuoli(value)
            }}
            onFocus={() => {
              // Carica tutti i ruoli quando si mette il focus se il campo è vuoto
              if (!formData.ruolo_nome) {
                handleSearchRuoli('')
              }
            }}
            onSelect={(ruolo) => {
              setFormData(prev => ({
                ...prev,
                ruolo_id: ruolo.id,
                ruolo_nome: ruolo.ruolo,
              }))
            }}
            options={ruoli}
            placeholder="Cerca o seleziona ruolo..."
            displayKey="ruolo"
            searchOnFocus={true}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Orari Diurni</label>
          <input
            type="text"
            value={formData.orari_diurni}
            onChange={(e) => setFormData({ ...formData, orari_diurni: e.target.value })}
            placeholder="es. 10:00-14:00"
          />
        </div>

        <div className="form-group">
          <label>Orari Serali</label>
          <input
            type="text"
            value={formData.orari_serali}
            onChange={(e) => setFormData({ ...formData, orari_serali: e.target.value })}
            placeholder="es. 19:00-23:00"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Stato</label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.colloquio}
              onChange={(e) => setFormData({ ...formData, colloquio: e.target.checked })}
            />
            Colloquio
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.prova}
              onChange={(e) => setFormData({ ...formData, prova: e.target.checked })}
            />
            Prova
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.assunzione}
              onChange={(e) => setFormData({ ...formData, assunzione: e.target.checked })}
            />
            Assunzione
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Fee (€)</label>
        <input
          type="number"
          step="0.01"
          value={formData.fee}
          onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
          placeholder="0.00"
          min="0"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : fisso ? 'Aggiorna' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

