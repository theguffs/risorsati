import { supabase } from '../lib/supabase'

export const serviziService = {
  // Leggi tutti i servizi con paginazione
  async getAll(page = 1, pageSize = 50) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('servizi')
      .select('*, risorse(nome), ruoli(ruolo, listino, fee_per_ora)', { count: 'exact' })
      .order('data', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  // Leggi i servizi di un mese specifico
  async getByMonth(mese, anno) {
    // Filtra per mese e anno usando la data
    const firstDay = new Date(anno, mese - 1, 1).toISOString().split('T')[0]
    const lastDay = new Date(anno, mese, 0).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('servizi')
      .select('*, risorse(nome), ruoli(ruolo, listino, fee_per_ora)')
      .gte('data', firstDay)
      .lte('data', lastDay)
      .order('data', { ascending: false })

    if (error) throw error
    return data
  },

  // Leggi un servizio per ID
  async getById(id) {
    const { data, error } = await supabase
      .from('servizi')
      .select('*, risorse(id, nome), ruoli(id, ruolo)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea un nuovo servizio
  async create(servizio) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')
    
    const { data, error } = await supabase
      .from('servizi')
      .insert([{ ...servizio, owner_email: user.email }])
      .select('*, risorse(nome), ruoli(ruolo)')
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna un servizio
  async update(id, servizio) {
    const { data, error } = await supabase
      .from('servizi')
      .update(servizio)
      .eq('id', id)
      .select('*, risorse(nome), ruoli(ruolo)')
      .single()

    if (error) throw error
    return data
  },

  // Elimina un servizio
  async delete(id) {
    const { error } = await supabase
      .from('servizi')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Cerca risorse per nome
  async searchRisorse(query) {
    const { data, error } = await supabase
      .from('risorse')
      .select('id, nome')
      .ilike('nome', `%${query}%`)
      .limit(50)

    if (error) throw error
    return data
  },

  // Ottieni tutte le risorse
  async getAllRisorse() {
    const { data, error } = await supabase
      .from('risorse')
      .select('id, nome')
      .order('nome', { ascending: true })
      .limit(200)

    if (error) throw error
    return data
  },

  // Cerca ruoli per nome
  async searchRuoli(query) {
    const { data, error } = await supabase
      .from('ruoli')
      .select('id, ruolo')
      .ilike('ruolo', `%${query}%`)
      .limit(50)

    if (error) throw error
    return data
  },

  // Ottieni tutti i ruoli
  async getAllRuoli() {
    const { data, error } = await supabase
      .from('ruoli')
      .select('id, ruolo')
      .order('livello', { ascending: true })
      .limit(100)

    if (error) throw error
    return data
  },

  // Cerca ristoranti per nome
  async searchRistoranti(query) {
    const { data, error } = await supabase
      .from('ristoranti')
      .select('id, nome')
      .ilike('nome', `%${query}%`)
      .limit(50)

    if (error) throw error
    return data
  },

  // Ottieni tutti i ristoranti
  async getAllRistoranti() {
    const { data, error } = await supabase
      .from('ristoranti')
      .select('id, nome')
      .order('nome', { ascending: true })
      .limit(200)

    if (error) throw error
    return data
  },

  // Ottieni i dettagli di un ruolo (listino e fee_per_ora)
  async getRuoloDetails(ruoloId) {
    if (!ruoloId) return null
    
    const { data, error } = await supabase
      .from('ruoli')
      .select('id, ruolo, listino, fee_per_ora')
      .eq('id', ruoloId)
      .single()

    if (error) throw error
    return data
  },

  // Calcola paga e fee basandosi su durata e ruolo
  calcolaPagaEFee(durataOre, ruolo) {
    if (!durataOre || !ruolo || !ruolo.listino || !ruolo.fee_per_ora) {
      return { paga: null, fee: null }
    }

    const paga = durataOre * parseFloat(ruolo.listino)
    const fee = durataOre * parseFloat(ruolo.fee_per_ora)

    return { paga, fee }
  },

  // Calcola durata in ore da orario_inizio e orario_fine
  // Gestisce il caso in cui il servizio inizia la sera e finisce dopo la mezzanotte
  calcolaDurata(orarioInizio, orarioFine) {
    if (!orarioInizio || !orarioFine) return null

    const [inizioOre, inizioMinuti] = orarioInizio.split(':').map(Number)
    const [fineOre, fineMinuti] = orarioFine.split(':').map(Number)

    const inizioMinutiTotali = inizioOre * 60 + inizioMinuti
    let fineMinutiTotali = fineOre * 60 + fineMinuti
    
    // Se l'orario fine è minore dell'orario inizio, significa che è passata la mezzanotte
    // Esempio: inizio 19:00, fine 02:00 -> 02:00 è del giorno dopo
    if (fineMinutiTotali < inizioMinutiTotali) {
      // Aggiungi 24 ore (1440 minuti) all'orario fine
      fineMinutiTotali += 24 * 60
    }
    
    // Se l'orario fine è esattamente 00:00 e l'inizio è tardi, trattalo come 24:00
    // Esempio: inizio 19:00, fine 00:00 -> 00:00 è mezzanotte del giorno dopo
    if (fineOre === 0 && fineMinuti === 0 && inizioOre >= 12) {
      fineMinutiTotali = 24 * 60 // 1440 minuti (24 ore)
    }

    const durataMinuti = fineMinutiTotali - inizioMinutiTotali
    if (durataMinuti <= 0) return null

    return durataMinuti / 60 // Converti in ore
  },
}

