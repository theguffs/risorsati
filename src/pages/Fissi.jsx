import { useEffect, useState } from 'react'
import { fissiService } from '../services/fissiService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { FissoForm } from '../components/Form/FissoForm'
import './Page.css'

export const Fissi = () => {
  const [fissi, setFissi] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFisso, setSelectedFisso] = useState(null)
  const [duplicating, setDuplicating] = useState(false)

  // Filtro mese/anno - default mese corrente
  const currentDate = new Date()
  const [mese, setMese] = useState(currentDate.getMonth() + 1)
  const [anno, setAnno] = useState(currentDate.getFullYear())

  const isCurrentMonth = 
    mese === currentDate.getMonth() + 1 && 
    anno === currentDate.getFullYear()

  useEffect(() => {
    loadFissi()
  }, [mese, anno])

  const loadFissi = async () => {
    try {
      setLoading(true)
      const data = await fissiService.getByMonth(mese, anno)
      setFissi(data || [])
    } catch (error) {
      console.error('Errore caricamento fissi:', error)
      alert('Errore nel caricamento dei fissi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedFisso(null)
    setIsModalOpen(true)
  }

  const handleEdit = (fisso) => {
    setSelectedFisso(fisso)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo fisso?')) {
      return
    }

    try {
      await fissiService.delete(id)
      loadFissi()
      alert('Fisso eliminato con successo')
    } catch (error) {
      console.error('Errore eliminazione fisso:', error)
      alert('Errore nell\'eliminazione: ' + error.message)
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedFisso(null)
    loadFissi()
  }

  const handleDuplicateMonth = async () => {
    if (!window.confirm(`Vuoi duplicare tutti i fissi di ${getMonthName(mese)} ${anno} al mese successivo?`)) {
      return
    }

    try {
      setDuplicating(true)
      
      // Calcola il mese successivo
      let nextMese = mese + 1
      let nextAnno = anno
      if (nextMese > 12) {
        nextMese = 1
        nextAnno = anno + 1
      }

      await fissiService.duplicateMonth(mese, anno, nextMese, nextAnno)
      
      // Aggiorna il filtro al mese successivo
      setMese(nextMese)
      setAnno(nextAnno)
      
      alert(`Fissi duplicati con successo! Ora visualizzi ${getMonthName(nextMese)} ${nextAnno}`)
      loadFissi()
    } catch (error) {
      console.error('Errore duplicazione:', error)
      alert('Errore nella duplicazione: ' + error.message)
    } finally {
      setDuplicating(false)
    }
  }

  const getMonthName = (monthNum) => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ]
    return months[monthNum - 1]
  }

  const columns = [
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
      key: 'orari_diurni', 
      label: 'Orari Diurni',
      render: (_, row) => row.orari_diurni || '-',
    },
    { 
      key: 'orari_serali', 
      label: 'Orari Serali',
      render: (_, row) => row.orari_serali || '-',
    },
    {
      key: 'stato',
      label: 'Stato',
      render: (_, row) => {
        const stati = []
        if (row.colloquio) stati.push('Colloquio')
        if (row.prova) stati.push('Prova')
        if (row.assunzione) stati.push('Assunzione')
        return stati.join(', ') || '-'
      },
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
        <h1>Fissi</h1>
        <p>Gestione risorse fisse mensili</p>
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
          + Nuovo Fisso
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleDuplicateMonth}
          disabled={duplicating || fissi.length === 0}
          title="Duplica tutti i fissi di questo mese al mese successivo"
        >
          {duplicating ? 'Duplicazione...' : '📋 Duplica da questo mese'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        Mostrando {fissi.length} risors{fissi.length === 1 ? 'a' : 'e'} fiss{fissi.length === 1 ? 'a' : 'e'} per {getMonthName(mese)} {anno}
      </div>

      <DataTable
        columns={columns}
        data={fissi}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFisso(null)
        }}
        title={selectedFisso ? 'Modifica Fisso' : 'Nuovo Fisso'}
      >
        <FissoForm
          fisso={selectedFisso}
          mese={mese}
          anno={anno}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedFisso(null)
          }}
        />
      </Modal>
    </div>
  )
}
