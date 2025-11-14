import { useEffect, useState } from 'react'
import { risorseService } from '../services/risorseService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { RisorsaForm } from '../components/Form/RisorsaForm'
import './Page.css'

export const Risorse = () => {
  const [risorse, setRisorse] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRisorsa, setSelectedRisorsa] = useState(null)

  useEffect(() => {
    loadRisorse()
  }, [])

  const loadRisorse = async () => {
    try {
      setLoading(true)
      const data = await risorseService.getAll()
      setRisorse(data || [])
    } catch (error) {
      console.error('Errore caricamento risorse:', error)
      alert('Errore nel caricamento delle risorse: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedRisorsa(null)
    setIsModalOpen(true)
  }

  const handleEdit = (risorsa) => {
    setSelectedRisorsa(risorsa)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa risorsa?')) {
      return
    }

    try {
      await risorseService.delete(id)
      loadRisorse()
      alert('Risorsa eliminata con successo')
    } catch (error) {
      console.error('Errore eliminazione risorsa:', error)
      alert('Errore nell\'eliminazione: ' + error.message)
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedRisorsa(null)
    loadRisorse()
  }

  const columns = [
    { key: 'nome', label: 'Nome Risorsa' },
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
        <h1>Risorse</h1>
        <p>Gestione dipendenti e risorse</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuova Risorsa
        </button>
      </div>

      <DataTable
        columns={columns}
        data={risorse}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRisorsa(null)
        }}
        title={selectedRisorsa ? 'Modifica Risorsa' : 'Nuova Risorsa'}
      >
        <RisorsaForm
          risorsa={selectedRisorsa}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedRisorsa(null)
          }}
        />
      </Modal>
    </div>
  )
}
