import { supabase } from '../lib/supabase'

export const fissiService = {
  // Leggi tutti i fissi
  async getAll() {
    const { data, error } = await supabase
      .from('fissi')
      .select('*, risorse(nome), ruoli(ruolo)')
      .order('data', { ascending: false })

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
}

