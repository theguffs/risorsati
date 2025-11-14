import { supabase } from '../lib/supabase'

export const ristorantiService = {
  // Leggi tutti i ristoranti
  async getAll() {
    const { data, error } = await supabase
      .from('ristoranti')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return data
  },

  // Leggi un ristorante per ID
  async getById(id) {
    const { data, error } = await supabase
      .from('ristoranti')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea un nuovo ristorante
  async create(ristorante) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')
    
    const { data, error } = await supabase
      .from('ristoranti')
      .insert([{ ...ristorante, owner_email: user.email }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna un ristorante
  async update(id, ristorante) {
    const { data, error } = await supabase
      .from('ristoranti')
      .update(ristorante)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina un ristorante
  async delete(id) {
    const { error } = await supabase
      .from('ristoranti')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

