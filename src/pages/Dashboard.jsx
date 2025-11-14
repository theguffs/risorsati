import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

export const Dashboard = () => {
  const [stats, setStats] = useState({
    servizi: 0,
    fissi: 0,
    risorse: 0,
    ristoranti: 0,
    ruoli: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [servizi, fissi, risorse, ristoranti, ruoli] = await Promise.all([
        supabase.from('servizi').select('id', { count: 'exact', head: true }),
        supabase.from('fissi').select('id', { count: 'exact', head: true }),
        supabase.from('risorse').select('id', { count: 'exact', head: true }),
        supabase.from('ristoranti').select('id', { count: 'exact', head: true }),
        supabase.from('ruoli').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        servizi: servizi.count || 0,
        fissi: fissi.count || 0,
        risorse: risorse.count || 0,
        ristoranti: ristoranti.count || 0,
        ruoli: ruoli.count || 0,
      })
    } catch (error) {
      console.error('Errore caricamento statistiche:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Caricamento...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Panoramica generale del sistema</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Servizi</h3>
            <p className="stat-number">{stats.servizi.toLocaleString()}</p>
            <p className="stat-label">Servizi totali</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📌</div>
          <div className="stat-content">
            <h3>Fissi</h3>
            <p className="stat-number">{stats.fissi.toLocaleString()}</p>
            <p className="stat-label">Assunzioni fisse</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Risorse</h3>
            <p className="stat-number">{stats.risorse.toLocaleString()}</p>
            <p className="stat-label">Dipendenti</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Ristoranti</h3>
            <p className="stat-number">{stats.ristoranti.toLocaleString()}</p>
            <p className="stat-label">Clienti</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Ruoli</h3>
            <p className="stat-number">{stats.ruoli.toLocaleString()}</p>
            <p className="stat-label">Ruoli lavorativi</p>
          </div>
        </div>
      </div>
    </div>
  )
}




