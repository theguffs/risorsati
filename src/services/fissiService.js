import { supabase } from '../lib/supabase'

export const fissiService = {
  // Leggi tutti i fissi con filtro opzionale per mese/anno
  async getAll(mese = null, anno = null) {
    let query = supabase
      .from('fissi')
      .select('*, risorse(nome), ruoli(ruolo)')
    
    if (mese && anno) {
      // Filtra per mese e anno usando la data
      const firstDay = new Date(anno, mese - 1, 1).toISOString().split('T')[0]
      const lastDay = new Date(anno, mese, 0).toISOString().split('T')[0]
      query = query
        .gte('data', firstDay)
        .lte('data', lastDay)
    } else if (anno) {
      // Filtra solo per anno
      const firstDay = new Date(anno, 0, 1).toISOString().split('T')[0]
      const lastDay = new Date(anno, 11, 31).toISOString().split('T')[0]
      query = query
        .gte('data', firstDay)
        .lte('data', lastDay)
    }
    
    const { data, error } = await query
      .order('data', { ascending: false })

    if (error) throw error
    return data
  },

  // Leggi i fissi di un mese specifico
  async getByMonth(mese, anno) {
    // Filtra per mese e anno usando la data (primo giorno del mese)
    const firstDay = new Date(anno, mese - 1, 1).toISOString().split('T')[0]
    const lastDay = new Date(anno, mese, 0).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('fissi')
      .select('*, risorse(nome), ruoli(ruolo)')
      .gte('data', firstDay)
      .lte('data', lastDay)
      .order('cliente', { ascending: true })
      .order('risorsa_nome', { ascending: true })

    if (error) throw error
    return data
  },

  // Duplica i fissi da un mese all'altro
  async duplicateMonth(fromMese, fromAnno, toMese, toAnno) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')

    // Carica i fissi del mese sorgente
    const sourceFissi = await this.getByMonth(fromMese, fromAnno)
    
    if (!sourceFissi || sourceFissi.length === 0) {
      throw new Error('Nessun fisso trovato per il mese selezionato')
    }

    // Calcola la data di destinazione (primo giorno del mese)
    const toDate = new Date(toAnno, toMese - 1, 1)
    const toDateString = toDate.toISOString().split('T')[0]

    // Prepara i nuovi record (rimuovi id e campi generati)
    const newFissi = sourceFissi.map(fisso => {
      const { id, risorse, ruoli, created_at, updated_at, mese, ...fissoData } = fisso
      return {
        ...fissoData,
        data: toDateString,
        owner_email: user.email,
      }
    })

    // Inserisci i nuovi record
    const { data, error } = await supabase
      .from('fissi')
      .insert(newFissi)
      .select('*, risorse(nome), ruoli(ruolo)')

    if (error) throw error
    return data
  },

  // Leggi un fisso per ID
  async getById(id) {
    const { data, error } = await supabase
      .from('fissi')
      .select('*, risorse(nome), ruoli(ruolo)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea un nuovo fisso
  async create(fisso) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')
    
    const { data, error } = await supabase
      .from('fissi')
      .insert([{ ...fisso, owner_email: user.email }])
      .select('*, risorse(nome), ruoli(ruolo)')
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna un fisso
  async update(id, fisso) {
    const { data, error } = await supabase
      .from('fissi')
      .update(fisso)
      .eq('id', id)
      .select('*, risorse(nome), ruoli(ruolo)')
      .single()

    if (error) throw error
    return data
  },

  // Elimina un fisso
  async delete(id) {
    const { error } = await supabase
      .from('fissi')
      .delete()
      .eq('id', id)

    if (error) throw error
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
}

