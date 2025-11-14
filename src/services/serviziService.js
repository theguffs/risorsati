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
      .limit(10)

    if (error) throw error
    return data
  },

  // Cerca ruoli per nome
  async searchRuoli(query) {
    const { data, error } = await supabase
      .from('ruoli')
      .select('id, ruolo')
      .ilike('ruolo', `%${query}%`)
      .limit(10)

    if (error) throw error
    return data
  },

  // Cerca ristoranti per nome
  async searchRistoranti(query) {
    const { data, error } = await supabase
      .from('ristoranti')
      .select('id, nome')
      .ilike('nome', `%${query}%`)
      .limit(10)

    if (error) throw error
    return data
  },
}

