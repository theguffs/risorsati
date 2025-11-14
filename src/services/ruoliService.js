import { supabase } from '../lib/supabase'

export const ruoliService = {
  // Leggi tutti i ruoli
  async getAll() {
    const { data, error } = await supabase
      .from('ruoli')
      .select('*')
      .order('livello', { ascending: true })

    if (error) throw error
    return data
  },

  // Leggi un ruolo per ID
  async getById(id) {
    const { data, error } = await supabase
      .from('ruoli')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Crea un nuovo ruolo
  async create(ruolo) {
    // Ottieni l'email dell'utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')
    
    const { data, error } = await supabase
      .from('ruoli')
      .insert([{ ...ruolo, owner_email: user.email }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna un ruolo
  async update(id, ruolo) {
    const { data, error } = await supabase
      .from('ruoli')
      .update(ruolo)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina un ruolo
  async delete(id) {
    const { error } = await supabase
      .from('ruoli')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

