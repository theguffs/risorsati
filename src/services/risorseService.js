import { supabase } from '../lib/supabase'

export const risorseService = {
  // Leggi tutte le risorse
  async getAll() {
    const { data, error } = await supabase
      .from('risorse')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return data
  },

  // Leggi una risorsa per ID
  async getById(id) {
    const { data, error } = await supabase
      .from('risorse')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea una nuova risorsa
  async create(risorsa) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')
    
    const { data, error } = await supabase
      .from('risorse')
      .insert([{ ...risorsa, owner_email: user.email }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna una risorsa
  async update(id, risorsa) {
    const { data, error } = await supabase
      .from('risorse')
      .update(risorsa)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina una risorsa
  async delete(id) {
    const { error } = await supabase
      .from('risorse')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Cerca risorse per nome
  async search(query) {
    const { data, error } = await supabase
      .from('risorse')
      .select('id, nome')
      .ilike('nome', `%${query}%`)
      .limit(10)

    if (error) throw error
    return data
  },
}

