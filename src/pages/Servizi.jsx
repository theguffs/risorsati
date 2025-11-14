import { useEffect, useState } from 'react'
import { serviziService } from '../services/serviziService'
import { DataTable } from '../components/Table/DataTable'
import { Modal } from '../components/Modal/Modal'
import { ServizioForm } from '../components/Form/ServizioForm'
import './Page.css'

export const Servizi = () => {
  const [servizi, setServizi] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [totalCount, setTotalCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServizio, setSelectedServizio] = useState(null)

  useEffect(() => {
    loadServizi()
  }, [page])

  const loadServizi = async () => {
    try {
      setLoading(true)
      const { data, count } = await serviziService.getAll(page, pageSize)
      setServizi(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Errore caricamento servizi:', error)
      alert('Errore nel caricamento dei servizi: ' + error.message)
    } finally {
      setLoading(false)
    }
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
          ? `${row.durata_ore_numeric.toFixed(2)}h`
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

      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nuovo Servizio
        </button>
      </div>

      <DataTable
        columns={columns}
        data={servizi}
        loading={loading}
        onRowClick={(row) => handleEdit(row)}
      />

      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-secondary"
        >
          ← Precedente
        </button>
        <span>
          Pagina {page} di {Math.ceil(totalCount / pageSize)} ({totalCount} totali)
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * pageSize >= totalCount}
          className="btn btn-secondary"
        >
          Successiva →
        </button>
      </div>

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




