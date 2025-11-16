import { supabase } from '../lib/supabase'

// Genera un token sicuro (usa Web Crypto API nel browser)
const generateToken = () => {
  // Genera un token random usando Web Crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const formTokensService = {
  // Ottieni tutti i token dell'utente corrente
  async getAll() {
    const { data, error } = await supabase
      .from('form_tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Crea un nuovo token
  async create(nomeForm = null) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')

    const token = generateToken()
    
    const { data, error } = await supabase
      .from('form_tokens')
      .insert([{
        owner_email: user.email,
        token: token,
        nome_form: nomeForm || `Form ${new Date().toLocaleDateString('it-IT')}`,
        attivo: true,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Aggiorna un token
  async update(id, updates) {
    const { data, error } = await supabase
      .from('form_tokens')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina un token
  async delete(id) {
    const { error } = await supabase
      .from('form_tokens')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Rigenera un token (crea nuovo token per un ID esistente)
  async regenerate(id) {
    const newToken = generateToken()
    return await this.update(id, { token: newToken })
  },

  // Valida un token (per uso interno nell'API)
  async validateToken(token) {
    const { data, error } = await supabase
      .from('form_tokens')
      .select('owner_email, attivo')
      .eq('token', token)
      .single()

    if (error || !data) {
      return null
    }

    if (!data.attivo) {
      return null
    }

    // Nota: l'incremento di total_submissions viene fatto dall'Edge Function
    // Questa funzione è solo per validazione
    return data.owner_email
  },
}

