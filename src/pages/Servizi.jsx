import { useEffect, useState } from 'react'
import { serviziService } from '../services/serviziService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { ServizioForm } from '../components/Form/ServizioForm'
import './Page.css'

export const Servizi = () => {
  const [servizi, setServizi] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServizio, setSelectedServizio] = useState(null)

  // Filtro mese/anno - default mese corrente
  const currentDate = new Date()
  const [mese, setMese] = useState(currentDate.getMonth() + 1)
  const [anno, setAnno] = useState(currentDate.getFullYear())

  const isCurrentMonth = 
    mese === currentDate.getMonth() + 1 && 
    anno === currentDate.getFullYear()

  useEffect(() => {
    loadServizi()
  }, [mese, anno])

  const loadServizi = async () => {
    try {
      setLoading(true)
      const data = await serviziService.getByMonth(mese, anno)
      setServizi(data || [])
    } catch (error) {
      console.error('Errore caricamento servizi:', error)
      alert('Errore nel caricamento dei servizi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (monthNum) => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ]
    return months[monthNum - 1]
  }

  // Converte ore decimali in formato "ore:minuti"
  // Esempio: 5.5 -> "5:30", 8.5 -> "8:30", 5.25 -> "5:15"
  const formatDurata = (oreDecimali) => {
    if (!oreDecimali) return '-'
    
    const ore = Math.floor(oreDecimali)
    const minuti = Math.round((oreDecimali - ore) * 60)
    
    // Se i minuti sono 60, aggiungi un'ora e azzera i minuti
    if (minuti === 60) {
      return `${ore + 1}:00`
    }
    
    return `${ore}:${minuti.toString().padStart(2, '0')}`
  }

  const handleCreate = () => {
    setSelectedServizio(null)
    setIsModalOpen(true)
  }

  const handleEdit = (servizio) => {
    setSelectedServizio(servizio)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo servizio?')) {
      return
    }

    try {
      await serviziService.delete(id)
      loadServizi()
      alert('Servizio eliminato con successo')
    } catch (error) {
      console.error('Errore eliminazione servizio:', error)
      alert('Errore nell\'eliminazione: ' + error.message)
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedServizio(null)
    loadServizi()
  }

  const columns = [
    { key: 'data', label: 'Data' },
    { key: 'cliente', label: 'Cliente' },
    {
      key: 'risorsa',
      label: 'Risorsa',
      render: (_, row) => row.risorse?.nome || row.risorsa_nome || '-',
    },
    {
      key: 'ruolo',
      label: 'Ruolo',
      render: (_, row) => row.ruoli?.ruolo || row.ruolo_nome || '-',
    },
    {
      key: 'orario',
      label: 'Orario',
      render: (_, row) =>
        row.orario_inizio && row.orario_fine
          ? `${row.orario_inizio.substring(0, 5)} - ${row.orario_fine.substring(0, 5)}`
          : '-',
    },
    {
      key: 'durata',
      label: 'Durata',
      render: (_, row) =>
        row.durata_ore_numeric
          ? formatDurata(row.durata_ore_numeric)
          : '-',
    },
    {
      key: 'paga',
      label: 'Paga',
      render: (_, row) => (row.paga ? `€${row.paga.toFixed(2)}` : '-'),
    },
    {
      key: 'fee',
      label: 'Fee',
      render: (_, row) => (row.fee ? `€${row.fee.toFixed(2)}` : '-'),
    },
    {
      key: 'azioni',
      label: 'Azioni',
      render: (_, row) => (
        <div className="table-actions">
          <button
            className="btn-icon btn-edit"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            title="Modifica"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row.id)
            }}
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1>Servizi</h1>
        <p>Gestione servizi mensili</p>
      </div>

      {/* Filtro Mese/Anno */}
      <div className="page-filters" style={{ 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 500 }}>Mese:</label>
          <select
            value={mese}
            onChange={(e) => setMese(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 500 }}>Anno:</label>
          <input
            type="number"
            value={anno}
            onChange={(e) => setAnno(Number(e.target.value))}
            min="2020"
            max="2100"
            style={{
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              width: '100px',
            }}
          />
        </div>

        {isCurrentMonth && (
          <span style={{ 
            padding: '0.25rem 0.75rem',
            background: '#10b981',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}>
            Mese Corrente
          </span>
        )}

        {!isCurrentMonth && (
          <span style={{ 
            padding: '0.25rem 0.75rem',
            background: '#64748b',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}>
            Storico
          </span>
        )}
      </div>

      <div className="page-actions" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuovo Servizio
        </button>
      </div>

      <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        Mostrando {servizi.length} serviz{servizi.length === 1 ? 'io' : 'i'} per {getMonthName(mese)} {anno}
      </div>

      <DataTable
        columns={columns}
        data={servizi}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedServizio(null)
        }}
        title={selectedServizio ? 'Modifica Servizio' : 'Nuovo Servizio'}
      >
        <ServizioForm
          servizio={selectedServizio}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedServizio(null)
          }}
        />
      </Modal>
    </div>
  )
}




