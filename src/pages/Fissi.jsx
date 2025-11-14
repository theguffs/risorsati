import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DataTable } from '../components/Table/DataTable'
import './Page.css'

export const Fissi = () => {
  const [fissi, setFissi] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFissi()
  }, [])

  const loadFissi = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fissi')
        .select('*, risorse(nome), ruoli(ruolo)')
        .order('data', { ascending: false })
        .limit(100)

      if (error) throw error
      setFissi(data || [])
    } catch (error) {
      console.error('Errore caricamento fissi:', error)
    } finally {
      setLoading(false)
    }
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
    { key: 'orari_diurni', label: 'Orari Diurni' },
    { key: 'orari_serali', label: 'Orari Serali' },
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
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1>Fissi</h1>
        <p>Gestione assunzioni fisse</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary">+ Nuovo Fisso</button>
      </div>

      <DataTable
        columns={columns}
        data={fissi}
        loading={loading}
        onRowClick={(row) => console.log('Click su:', row)}
      />
    </div>
  )
}




