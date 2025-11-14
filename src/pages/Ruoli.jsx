import { useEffect, useState } from 'react'
import { ruoliService } from '../services/ruoliService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { RuoloForm } from '../components/Form/RuoloForm'
import './Page.css'

export const Ruoli = () => {
  const [ruoli, setRuoli] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRuolo, setSelectedRuolo] = useState(null)

  useEffect(() => {
    loadRuoli()
  }, [])

  const loadRuoli = async () => {
    try {
      setLoading(true)
      const data = await ruoliService.getAll()
      setRuoli(data || [])
    } catch (error) {
      console.error('Errore caricamento ruoli:', error)
      alert('Errore nel caricamento dei ruoli: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedRuolo(null)
    setIsModalOpen(true)
  }

  const handleEdit = (ruolo) => {
    setSelectedRuolo(ruolo)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo ruolo?')) {
      return
    }

    try {
      await ruoliService.delete(id)
      loadRuoli()
      alert('Ruolo eliminato con successo')
    } catch (error) {
      console.error('Errore eliminazione ruolo:', error)
      alert('Errore nell\'eliminazione: ' + error.message)
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedRuolo(null)
    loadRuoli()
  }

  const columns = [
    { key: 'livello', label: 'Livello' },
    { key: 'ruolo', label: 'Ruolo' },
    {
      key: 'listino',
      label: 'Listino',
      render: (value) => (value ? `€${value.toFixed(2)}` : '-'),
    },
    {
      key: 'fee_per_ora',
      label: 'Fee/Ora',
      render: (value) => (value ? `€${value.toFixed(2)}` : '-'),
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
        <h1>Ruoli</h1>
        <p>Gestione ruoli lavorativi e tariffari</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuovo Ruolo
        </button>
      </div>

      <DataTable
        columns={columns}
        data={ruoli}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRuolo(null)
        }}
        title={selectedRuolo ? 'Modifica Ruolo' : 'Nuovo Ruolo'}
      >
        <RuoloForm
          ruolo={selectedRuolo}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedRuolo(null)
          }}
        />
      </Modal>
    </div>
  )
}




