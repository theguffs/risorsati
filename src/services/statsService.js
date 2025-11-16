import { supabase } from '../lib/supabase'

export const statsService = {
  // Ottieni statistiche FEE per mese/anno
  async getFeeStatsByMonth(anno = null) {
    const currentYear = new Date().getFullYear()
    const targetYear = anno || currentYear

    // Ottieni FEE da servizi raggruppate per mese/anno
    const { data: serviziFees, error: serviziError } = await supabase
      .from('servizi')
      .select('mese, anno, fee')
      .eq('anno', targetYear)

    if (serviziError) throw serviziError

    // Ottieni FEE da fissi raggruppate per mese/anno
    // Nota: i fissi hanno solo mese, quindi dobbiamo filtrare per data
    const firstDay = new Date(targetYear, 0, 1).toISOString().split('T')[0]
    const lastDay = new Date(targetYear, 11, 31).toISOString().split('T')[0]

    const { data: fissiFees, error: fissiError } = await supabase
      .from('fissi')
      .select('mese, fee, data')
      .gte('data', firstDay)
      .lte('data', lastDay)

    if (fissiError) throw fissiError

    // Raggruppa FEE servizi per mese
    const serviziByMonth = {}
    serviziFees?.forEach(item => {
      if (!serviziByMonth[item.mese]) {
        serviziByMonth[item.mese] = 0
      }
      serviziByMonth[item.mese] += parseFloat(item.fee || 0)
    })

    // Raggruppa FEE fissi per mese
    const fissiByMonth = {}
    fissiFees?.forEach(item => {
      if (!fissiByMonth[item.mese]) {
        fissiByMonth[item.mese] = 0
      }
      fissiByMonth[item.mese] += parseFloat(item.fee || 0)
    })

    // Combina i dati per tutti i 12 mesi
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const stats = months.map(mese => {
      const feeServizi = serviziByMonth[mese] || 0
      const feeFissi = fissiByMonth[mese] || 0
      const feeTotale = feeServizi + feeFissi

      return {
        mese,
        anno: targetYear,
        feeServizi: parseFloat(feeServizi.toFixed(2)),
        feeFissi: parseFloat(feeFissi.toFixed(2)),
        feeTotale: parseFloat(feeTotale.toFixed(2)),
      }
    })

    return stats
  },

  // Ottieni lista degli anni disponibili (per il filtro)
  async getAvailableYears() {
    const currentYear = new Date().getFullYear()
    const years = new Set()
    
    // Genera un range di anni (dal 2020 all'anno corrente + 2 anni futuri)
    const startYear = 2020
    const endYear = currentYear + 2
    
    // Aggiungi tutti gli anni nel range
    for (let year = startYear; year <= endYear; year++) {
      years.add(year)
    }

    try {
      // Ottieni anni da servizi (distinct)
      const { data: serviziYears, error: serviziError } = await supabase
        .from('servizi')
        .select('anno')

      if (!serviziError && serviziYears) {
        serviziYears.forEach(item => {
          if (item.anno) years.add(item.anno)
        })
      }

      // Ottieni anni da fissi (estrai dalla data)
      const { data: fissiData, error: fissiError } = await supabase
        .from('fissi')
        .select('data')

      if (!fissiError && fissiData) {
        fissiData.forEach(item => {
          if (item.data) {
            const year = new Date(item.data).getFullYear()
            if (year) years.add(year)
          }
        })
      }
    } catch (error) {
      console.error('Errore nel recupero degli anni:', error)
    }

    // Converti in array ordinato (dal più recente al più vecchio)
    return Array.from(years).sort((a, b) => b - a)
  },

  // Calcola insights (fatturato medio, tasso di crescita)
  async getInsights() {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Ottieni tutti i servizi degli ultimi 12 mesi
    const twelveMonthsAgo = new Date(currentYear, currentMonth - 12, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    
    const { data: servizi12, error: error12 } = await supabase
      .from('servizi')
      .select('paga, fee, data')
      .gte('data', twelveMonthsAgo.toISOString().split('T')[0])
      .lte('data', lastDay.toISOString().split('T')[0])

    if (error12) throw error12

    // Ottieni tutti i servizi degli ultimi 6 mesi
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1)
    
    const { data: servizi6, error: error6 } = await supabase
      .from('servizi')
      .select('paga, fee, data')
      .gte('data', sixMonthsAgo.toISOString().split('T')[0])
      .lte('data', lastDay.toISOString().split('T')[0])

    if (error6) throw error6

    // Calcola fatturato totale (paga + fee)
    const calculateFatturato = (servizi) => {
      return servizi?.reduce((sum, item) => {
        const paga = parseFloat(item.paga || 0)
        const fee = parseFloat(item.fee || 0)
        return sum + paga + fee
      }, 0) || 0
    }

    const fatturato12Mesi = calculateFatturato(servizi12)
    const fatturato6Mesi = calculateFatturato(servizi6)
    
    // Fatturato medio mensile
    const fatturatoMedio12Mesi = fatturato12Mesi / 12
    const fatturatoMedio6Mesi = fatturato6Mesi / 6

    // Calcola tasso di crescita (ultimi 6 mesi vs 6 mesi precedenti)
    const sixMonthsBefore = new Date(currentYear, currentMonth - 12, 1)
    const sixMonthsAgoDate = new Date(currentYear, currentMonth - 6, 1)
    
    const { data: servizi6Precedenti, error: error6Prec } = await supabase
      .from('servizi')
      .select('paga, fee')
      .gte('data', sixMonthsBefore.toISOString().split('T')[0])
      .lt('data', sixMonthsAgoDate.toISOString().split('T')[0])

    if (error6Prec) throw error6Prec

    const fatturato6MesiPrecedenti = calculateFatturato(servizi6Precedenti)
    
    let tassoCrescita = 0
    if (fatturato6MesiPrecedenti > 0) {
      tassoCrescita = ((fatturato6Mesi - fatturato6MesiPrecedenti) / fatturato6MesiPrecedenti) * 100
    } else if (fatturato6Mesi > 0) {
      tassoCrescita = 100 // Crescita infinita se non c'erano dati prima
    }

    return {
      fatturatoMedio12Mesi: parseFloat(fatturatoMedio12Mesi.toFixed(2)),
      fatturatoMedio6Mesi: parseFloat(fatturatoMedio6Mesi.toFixed(2)),
      tassoCrescita: parseFloat(tassoCrescita.toFixed(2)),
    }
  },

  // Ottieni top 10 clienti per FEE
  async getTopClienti(limit = 10) {
    const { data, error } = await supabase
      .from('servizi')
      .select('cliente, fee')

    if (error) throw error

    // Raggruppa per cliente e somma le fee
    const clientiMap = {}
    data?.forEach(item => {
      const cliente = item.cliente
      const fee = parseFloat(item.fee || 0)
      if (!clientiMap[cliente]) {
        clientiMap[cliente] = 0
      }
      clientiMap[cliente] += fee
    })

    // Converti in array e ordina
    const topClienti = Object.entries(clientiMap)
      .map(([nome, fee]) => ({ nome, fee: parseFloat(fee.toFixed(2)) }))
      .sort((a, b) => b.fee - a.fee)
      .slice(0, limit)

    return topClienti
  },

  // Ottieni top 10 risorse per PAGA
  async getTopRisorse(limit = 10) {
    const { data, error } = await supabase
      .from('servizi')
      .select('risorsa_nome, paga')
      .not('risorsa_nome', 'is', null)

    if (error) throw error

    // Raggruppa per risorsa e somma le paga
    const risorseMap = {}
    data?.forEach(item => {
      const risorsa = item.risorsa_nome
      if (!risorsa) return
      const paga = parseFloat(item.paga || 0)
      if (!risorseMap[risorsa]) {
        risorseMap[risorsa] = 0
      }
      risorseMap[risorsa] += paga
    })

    // Converti in array e ordina
    const topRisorse = Object.entries(risorseMap)
      .map(([nome, paga]) => ({ nome, paga: parseFloat(paga.toFixed(2)) }))
      .sort((a, b) => b.paga - a.paga)
      .slice(0, limit)

    return topRisorse
  },
}

