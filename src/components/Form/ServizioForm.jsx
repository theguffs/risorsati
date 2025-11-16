import { useState, useEffect, useRef } from 'react'
import { serviziService } from '../../services/serviziService'
import { AutocompleteDropdown } from './AutocompleteDropdown'
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
  const [ruoloDetails, setRuoloDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)


  useEffect(() => {
    setIsInitialLoad(true)
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
      
      // Carica i dettagli del ruolo se presente
      if (servizio.ruolo_id) {
        loadRuoloDetails(servizio.ruolo_id).then(() => {
          // Dopo aver caricato i dettagli, permettere il calcolo automatico dopo un breve delay
          setTimeout(() => setIsInitialLoad(false), 200)
        })
      } else {
        setIsInitialLoad(false)
      }
    } else {
      // Reset form quando si crea un nuovo servizio
      setFormData({
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
      setRuoloDetails(null)
      setRisorse([])
      setRuoli([])
      setIsInitialLoad(false)
    }
  }, [servizio])

  // Carica i dettagli del ruolo quando viene selezionato
  const loadRuoloDetails = async (ruoloId, currentOrarioInizio = null, currentOrarioFine = null) => {
    if (!ruoloId) {
      setRuoloDetails(null)
      return
    }

    try {
      const details = await serviziService.getRuoloDetails(ruoloId)
      setRuoloDetails(details)
      
      // Forza il ricalcolo dopo aver caricato i dettagli
      // Usa i parametri passati o i valori correnti del form
      const orarioInizio = currentOrarioInizio ?? formData.orario_inizio
      const orarioFine = currentOrarioFine ?? formData.orario_fine
      
      if (autoCalculate && orarioInizio && orarioFine) {
        const durata = serviziService.calcolaDurata(orarioInizio, orarioFine)
        if (durata && details) {
          const { paga, fee } = serviziService.calcolaPagaEFee(durata, details)
          setFormData(prev => ({
            ...prev,
            paga: paga ? paga.toFixed(2) : '',
            fee: fee ? fee.toFixed(2) : '',
          }))
        }
      }
    } catch (err) {
      console.error('Errore caricamento dettagli ruolo:', err)
      setRuoloDetails(null)
    }
  }


  // Calcola automaticamente paga e fee - SEMPRE quando cambiano ruolo o orari
  useEffect(() => {
    if (!autoCalculate) return
    
    // Se è il caricamento iniziale di un servizio esistente, non calcolare
    // Ma se l'utente modifica qualcosa dopo, calcola
    if (isInitialLoad && servizio) {
      // Permetti il calcolo solo se l'utente ha modificato qualcosa
      const hasChanged = 
        formData.ruolo_id !== servizio.ruolo_id ||
        formData.orario_inizio !== servizio.orario_inizio ||
        formData.orario_fine !== servizio.orario_fine
      
      if (!hasChanged) {
        return // Non calcolare se non è cambiato nulla
      }
    }

    const durata = serviziService.calcolaDurata(formData.orario_inizio, formData.orario_fine)
    
    if (durata && ruoloDetails) {
      const { paga, fee } = serviziService.calcolaPagaEFee(durata, ruoloDetails)
      setFormData(prev => ({
        ...prev,
        paga: paga ? paga.toFixed(2) : '',
        fee: fee ? fee.toFixed(2) : '',
      }))
    } else if (!durata || !ruoloDetails) {
      // Se mancano dati, azzera solo se stiamo creando un nuovo servizio
      if (!servizio) {
        setFormData(prev => ({
          ...prev,
          paga: '',
          fee: '',
        }))
      }
    }
  }, [formData.orario_inizio, formData.orario_fine, ruoloDetails, autoCalculate, servizio, isInitialLoad, formData.ruolo_id])

  const handleSearchRisorse = async (query) => {
    // Se il campo è vuoto, carica tutte le risorse (limite ragionevole)
    if (!query || query.length === 0) {
      try {
        const data = await serviziService.getAllRisorse()
        setRisorse(data)
      } catch (err) {
        console.error('Errore caricamento risorse:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
    try {
      const data = await serviziService.searchRisorse(query)
      setRisorse(data)
    } catch (err) {
      console.error('Errore ricerca risorse:', err)
    }
  }

  const handleSelectRisorsa = (nome) => {
    const risorsa = risorse.find(r => r.nome === nome)
    if (risorsa) {
      setFormData(prev => ({
        ...prev,
        risorsa_id: risorsa.id,
        risorsa_nome: risorsa.nome,
      }))
    }
  }

  const handleSearchRuoli = async (query) => {
    // Se il campo è vuoto, carica tutti i ruoli
    if (!query || query.length === 0) {
      try {
        const data = await serviziService.getAllRuoli()
        setRuoli(data)
      } catch (err) {
        console.error('Errore caricamento ruoli:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
    try {
      const data = await serviziService.searchRuoli(query)
      setRuoli(data)
    } catch (err) {
      console.error('Errore ricerca ruoli:', err)
    }
  }

  const handleSelectRuolo = async (ruoloNome) => {
    const ruolo = ruoli.find(r => r.ruolo === ruoloNome)
    if (ruolo) {
      setFormData(prev => ({
        ...prev,
        ruolo_id: ruolo.id,
        ruolo_nome: ruolo.ruolo,
      }))
      await loadRuoloDetails(ruolo.id)
    }
  }

  const handleSearchRistoranti = async (query) => {
    // Se il campo è vuoto, carica tutti i ristoranti
    if (!query || query.length === 0) {
      try {
        const data = await serviziService.getAllRistoranti()
        setRistoranti(data)
      } catch (err) {
        console.error('Errore caricamento ristoranti:', err)
      }
      return
    }
    
    // Se c'è testo, cerca
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
        orario_inizio: formData.orario_inizio || null,
        orario_fine: formData.orario_fine || null,
        paga: formData.paga ? parseFloat(formData.paga) : null,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        risorsa_id: risorsaId || null,
        risorsa_nome: formData.risorsa_nome || null,
        ruolo_id: ruoloId || null,
        ruolo_nome: formData.ruolo_nome || null,
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
            showHint={!!formData.risorsa_id}
            hintText={formData.risorsa_id ? "✓ Risorsa selezionata" : ""}
          />
        </div>

        <div className="form-group">
          <AutocompleteDropdown
            label="Ruolo"
            value={formData.ruolo_nome}
            onChange={async (value) => {
              setFormData(prev => ({ ...prev, ruolo_nome: value, ruolo_id: '' }))
              await handleSearchRuoli(value)
              setRuoloDetails(null)
            }}
            onFocus={async () => {
              // Carica tutti i ruoli quando si mette il focus se il campo è vuoto
              if (!formData.ruolo_nome) {
                await handleSearchRuoli('')
              }
            }}
            onSelect={async (ruolo) => {
              setIsInitialLoad(false) // Permetti calcolo automatico quando si seleziona un ruolo
              const newRuoloId = ruolo.id
              setFormData(prev => ({
                ...prev,
                ruolo_id: newRuoloId,
                ruolo_nome: ruolo.ruolo,
              }))
              // Passa gli orari correnti per calcolare immediatamente
              await loadRuoloDetails(newRuoloId, formData.orario_inizio, formData.orario_fine)
            }}
            options={ruoli}
            placeholder="Cerca o seleziona ruolo..."
            displayKey="ruolo"
            searchOnFocus={true}
            showHint={!!ruoloDetails}
            hintText={ruoloDetails ? `Listino: €${parseFloat(ruoloDetails.listino).toFixed(2)}/h | Fee: €${parseFloat(ruoloDetails.fee_per_ora).toFixed(2)}/h` : ""}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Orario Inizio</label>
          <input
            type="time"
            value={formData.orario_inizio}
            onChange={(e) => {
              setIsInitialLoad(false) // Permetti calcolo automatico quando si cambia l'orario
              const newOrarioInizio = e.target.value
              
              setFormData(prev => {
                // Calcola immediatamente se abbiamo ruolo e orario fine
                if (autoCalculate && ruoloDetails && prev.orario_fine && newOrarioInizio) {
                  const durata = serviziService.calcolaDurata(newOrarioInizio, prev.orario_fine)
                  if (durata) {
                    const { paga, fee } = serviziService.calcolaPagaEFee(durata, ruoloDetails)
                    return {
                      ...prev,
                      orario_inizio: newOrarioInizio,
                      paga: paga ? paga.toFixed(2) : '',
                      fee: fee ? fee.toFixed(2) : '',
                    }
                  }
                }
                return { ...prev, orario_inizio: newOrarioInizio }
              })
            }}
          />
        </div>

        <div className="form-group">
          <label>Orario Fine</label>
          <input
            type="time"
            value={formData.orario_fine}
            onChange={(e) => {
              setIsInitialLoad(false) // Permetti calcolo automatico quando si cambia l'orario
              const newOrarioFine = e.target.value
              
              setFormData(prev => {
                // Calcola immediatamente se abbiamo ruolo e orario inizio
                if (autoCalculate && ruoloDetails && prev.orario_inizio && newOrarioFine) {
                  const durata = serviziService.calcolaDurata(prev.orario_inizio, newOrarioFine)
                  if (durata) {
                    const { paga, fee } = serviziService.calcolaPagaEFee(durata, ruoloDetails)
                    return {
                      ...prev,
                      orario_fine: newOrarioFine,
                      paga: paga ? paga.toFixed(2) : '',
                      fee: fee ? fee.toFixed(2) : '',
                    }
                  }
                }
                return { ...prev, orario_fine: newOrarioFine }
              })
            }}
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
            onChange={(e) => {
              setFormData({ ...formData, paga: e.target.value })
              setAutoCalculate(false) // Disabilita calcolo automatico se modificato manualmente
            }}
            placeholder="0.00"
          />
          {autoCalculate && ruoloDetails && (
            <span className="form-hint">Calcolato automaticamente</span>
          )}
        </div>

        <div className="form-group">
          <label>Fee (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.fee}
            onChange={(e) => {
              setFormData({ ...formData, fee: e.target.value })
              setAutoCalculate(false) // Disabilita calcolo automatico se modificato manualmente
            }}
            placeholder="0.00"
          />
          {autoCalculate && ruoloDetails && (
            <span className="form-hint">Calcolato automaticamente</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={autoCalculate}
            onChange={(e) => {
              setAutoCalculate(e.target.checked)
              if (e.target.checked) {
                // Ricalcola quando si riattiva
                const durata = serviziService.calcolaDurata(formData.orario_inizio, formData.orario_fine)
                if (durata && ruoloDetails) {
                  const { paga, fee } = serviziService.calcolaPagaEFee(durata, ruoloDetails)
                  setFormData(prev => ({
                    ...prev,
                    paga: paga ? paga.toFixed(2) : '',
                    fee: fee ? fee.toFixed(2) : '',
                  }))
                }
              }
            }}
          />
          {' '}Calcola automaticamente Paga e Fee
        </label>
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

