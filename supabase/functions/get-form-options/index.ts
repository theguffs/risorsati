// Supabase Edge Function per ottenere le opzioni (ristoranti, risorse, ruoli) per un token
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-form-token, authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestisci CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ottieni il token dall'header personalizzato X-Form-Token
    // Usiamo un header personalizzato per evitare che Supabase validi come JWT
    // Ma manteniamo anche Authorization per soddisfare i requisiti di Supabase
    let token = req.headers.get('X-Form-Token')
    
    // Fallback: se X-Form-Token non è presente, prova a estrarre da Authorization
    if (!token) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '')
      }
    }
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token mancante o non valido' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Inizializza Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Valida il token e ottieni l'owner_email
    const { data: tokenData, error: tokenError } = await supabase
      .from('form_tokens')
      .select('owner_email, attivo, token')
      .eq('token', token)
      .single()

    // Log per debug (rimuovi in produzione)
    console.log('Token ricevuto:', token ? token.substring(0, 10) + '...' : 'null')
    console.log('Token error:', tokenError)
    console.log('Token data:', tokenData)

    if (tokenError) {
      return new Response(
        JSON.stringify({ 
          error: 'Token non valido o disattivato',
          details: tokenError.message 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token non trovato nel database' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!tokenData.attivo) {
      return new Response(
        JSON.stringify({ error: 'Token disattivato' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const ownerEmail = tokenData.owner_email

    // Ottieni tutte le opzioni per questo utente
    // NOTA: Le risorse non vengono più restituite perché ora è un campo di testo con validazione
    const [ristoranti, ruoli] = await Promise.all([
      // Ristoranti
      supabase
        .from('ristoranti')
        .select('nome')
        .eq('owner_email', ownerEmail)
        .order('nome', { ascending: true }),
      
      // Ruoli
      supabase
        .from('ruoli')
        .select('ruolo')
        .eq('owner_email', ownerEmail)
        .order('livello', { ascending: true }),
    ])

    return new Response(
      JSON.stringify({
        success: true,
        ristoranti: ristoranti.data?.map(r => r.nome) || [],
        ruoli: ruoli.data?.map(r => r.ruolo) || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Errore interno del server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

