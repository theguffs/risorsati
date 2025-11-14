import { useEffect, useState } from 'react'
import { ristorantiService } from '../services/ristorantiService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { RistoranteForm } from '../components/Form/RistoranteForm'
import './Page.css'

export const Ristoranti = () => {
  const [ristoranti, setRistoranti] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRistorante, setSelectedRistorante] = useState(null)

  useEffect(() => {
    loadRistoranti()
  }, [])

  const loadRistoranti = async () => {
    try {
      setLoading(true)
      const data = await ristorantiService.getAll()
      setRistoranti(data || [])
    } catch (error) {
      console.error('Errore caricamento ristoranti:', error)
      alert('Errore nel caricamento dei ristoranti: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedRistorante(null)
    setIsModalOpen(true)
  }

  const handleEdit = (ristorante) => {
    setSelectedRistorante(ristorante)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo ristorante?')) {
      return
    }

    try {
      await ristorantiService.delete(id)
      loadRistoranti()
      alert('Ristorante eliminato con successo')
    } catch (error) {
      console.error('Errore eliminazione ristorante:', error)
      alert('Errore nell\'eliminazione: ' + error.message)
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedRistorante(null)
    loadRistoranti()
  }

  const columns = [
    { key: 'nome', label: 'Nome Ristorante' },
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
        <h1>Ristoranti</h1>
        <p>Gestione clienti e ristoranti</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuovo Ristorante
        </button>
      </div>

      <DataTable
        columns={columns}
        data={ristoranti}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRistorante(null)
        }}
        title={selectedRistorante ? 'Modifica Ristorante' : 'Nuovo Ristorante'}
      >
        <RistoranteForm
          ristorante={selectedRistorante}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedRistorante(null)
          }}
        />
      </Modal>
    </div>
  )
}




