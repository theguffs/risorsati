import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { statsService } from '../services/statsService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

export const Dashboard = () => {
  const [stats, setStats] = useState({
    servizi: 0,
    fissi: 0,
    risorse: 0,
    ristoranti: 0,
    ruoli: 0,
  })
  const [feeStats, setFeeStats] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [loadingFeeStats, setLoadingFeeStats] = useState(false)
  const [insights, setInsights] = useState({
    fatturatoMedio12Mesi: 0,
    fatturatoMedio6Mesi: 0,
    tassoCrescita: 0,
  })
  const [topClienti, setTopClienti] = useState([])
  const [topRisorse, setTopRisorse] = useState([])
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    loadStats()
    loadAvailableYears()
    loadInsights()
    loadTopClienti()
    loadTopRisorse()
  }, [])

  useEffect(() => {
    loadFeeStats()
  }, [selectedYear])

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

  const loadAvailableYears = async () => {
    try {
      const years = await statsService.getAvailableYears()
      setAvailableYears(years)
      // Mantieni l'anno corrente selezionato se è nell'elenco
      const currentYear = new Date().getFullYear()
      if (years.includes(currentYear)) {
        setSelectedYear(currentYear)
      } else if (years.length > 0) {
        // Altrimenti seleziona il primo anno disponibile
        setSelectedYear(years[0])
      }
    } catch (error) {
      console.error('Errore caricamento anni disponibili:', error)
      // In caso di errore, genera almeno un range base
      const currentYear = new Date().getFullYear()
      const fallbackYears = []
      for (let year = 2020; year <= currentYear + 2; year++) {
        fallbackYears.push(year)
      }
      setAvailableYears(fallbackYears.reverse())
      setSelectedYear(currentYear)
    }
  }

  const loadFeeStats = async () => {
    try {
      setLoadingFeeStats(true)
      const data = await statsService.getFeeStatsByMonth(selectedYear)
      setFeeStats(data)
    } catch (error) {
      console.error('Errore caricamento statistiche FEE:', error)
    } finally {
      setLoadingFeeStats(false)
    }
  }

  const getMonthName = (monthNum) => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ]
    return months[monthNum - 1]
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const loadInsights = async () => {
    try {
      setLoadingInsights(true)
      const data = await statsService.getInsights()
      setInsights(data)
    } catch (error) {
      console.error('Errore caricamento insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const loadTopClienti = async () => {
    try {
      const data = await statsService.getTopClienti(10)
      setTopClienti(data)
    } catch (error) {
      console.error('Errore caricamento top clienti:', error)
    }
  }

  const loadTopRisorse = async () => {
    try {
      const data = await statsService.getTopRisorse(10)
      setTopRisorse(data)
    } catch (error) {
      console.error('Errore caricamento top risorse:', error)
    }
  }

  const totalFeeServizi = feeStats.reduce((sum, item) => sum + item.feeServizi, 0)
  const totalFeeFissi = feeStats.reduce((sum, item) => sum + item.feeFissi, 0)
  const totalFeeTotale = feeStats.reduce((sum, item) => sum + item.feeTotale, 0)

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

      {/* Sezione Statistiche FEE */}
      <div className="fee-stats-section">
        <div className="fee-stats-header">
          <h2>Statistiche FEE per Mese</h2>
          <div className="fee-stats-filter">
            <label htmlFor="year-filter">Anno:</label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {availableYears.map(year => {
                const isCurrentYear = year === new Date().getFullYear()
                return (
                  <option key={year} value={year}>
                    {year}{isCurrentYear ? ' ⭐' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {loadingFeeStats ? (
          <div className="dashboard-loading">Caricamento statistiche FEE...</div>
        ) : (
          <>
            <div className="fee-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={feeStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mese" 
                    tickFormatter={(value) => getMonthName(value).substring(0, 3)}
                  />
                  <YAxis 
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => getMonthName(label)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="feeServizi" 
                    fill="#60a5fa" 
                    name="FEE Servizi"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="feeFissi" 
                    fill="#fbbf24" 
                    name="FEE Fissi"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="feeTotale" 
                    fill="#34d399" 
                    name="FEE Totale"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Riepilogo totali */}
            <div className="fee-summary">
              <div className="fee-summary-item">
                <span className="fee-summary-label">FEE Servizi {selectedYear}:</span>
                <span className="fee-summary-value">{formatCurrency(totalFeeServizi)}</span>
              </div>
              <div className="fee-summary-item">
                <span className="fee-summary-label">FEE Fissi {selectedYear}:</span>
                <span className="fee-summary-value">{formatCurrency(totalFeeFissi)}</span>
              </div>
              <div className="fee-summary-item fee-summary-total">
                <span className="fee-summary-label">FEE Totale {selectedYear}:</span>
                <span className="fee-summary-value">{formatCurrency(totalFeeTotale)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sezione Insights */}
      <div className="insights-section">
        <h2>Insights</h2>
        {loadingInsights ? (
          <div className="dashboard-loading">Caricamento insights...</div>
        ) : (
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-label">Fatturato medio mensile - 12 mesi</div>
              <div className="insight-value">{formatCurrency(insights.fatturatoMedio12Mesi)}</div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Fatturato medio mensile - ultimi 6 mesi</div>
              <div className="insight-value">{formatCurrency(insights.fatturatoMedio6Mesi)}</div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Tasso di crescita mensile - ultimi 6 mesi</div>
              <div className={`insight-value ${insights.tassoCrescita >= 0 ? 'positive' : 'negative'}`}>
                {insights.tassoCrescita >= 0 ? '+' : ''}{insights.tassoCrescita.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sezione Top Clienti e Risorse */}
      <div className="top-section">
        <div className="top-table-container">
          <h2>Migliori Clienti (Top 10)</h2>
          {topClienti.length === 0 ? (
            <div className="no-data">Nessun dato disponibile</div>
          ) : (
            <table className="top-table">
              <thead>
                <tr>
                  <th>Nome Cliente</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {topClienti.map((cliente, index) => (
                  <tr key={index}>
                    <td>{cliente.nome}</td>
                    <td className="fee-amount">{formatCurrency(cliente.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="top-table-container">
          <h2>Migliori Risorse</h2>
          {topRisorse.length === 0 ? (
            <div className="no-data">Nessun dato disponibile</div>
          ) : (
            <table className="top-table">
              <thead>
                <tr>
                  <th>Nome Risorsa</th>
                  <th>Paga</th>
                </tr>
              </thead>
              <tbody>
                {topRisorse.map((risorsa, index) => (
                  <tr key={index}>
                    <td>{risorsa.nome}</td>
                    <td className="fee-amount">{formatCurrency(risorsa.paga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}




