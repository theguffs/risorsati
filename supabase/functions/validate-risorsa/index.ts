// Supabase Edge Function per validare se una risorsa esiste
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-form-token, authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Gestisci CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ottieni il token dall'header personalizzato X-Form-Token
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
      .select('owner_email, attivo')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData || !tokenData.attivo) {
      return new Response(
        JSON.stringify({ error: 'Token non valido o disattivato' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Leggi i dati dal body
    const { risorsa_nome } = await req.json()

    if (!risorsa_nome) {
      return new Response(
        JSON.stringify({ error: 'Nome risorsa mancante' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Cerca la risorsa (case-insensitive)
    const { data: risorsa, error: searchError } = await supabase
      .from('risorse')
      .select('id, nome')
      .eq('owner_email', tokenData.owner_email)
      .ilike('nome', risorsa_nome.trim())
      .single()

    if (searchError || !risorsa) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          message: 'Nome risorsa non registrato. Verifica di aver scritto correttamente nome e cognome.'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        valid: true,
        risorsa_id: risorsa.id,
        risorsa_nome: risorsa.nome
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore interno del server'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

