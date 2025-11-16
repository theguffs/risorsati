// Supabase Edge Function per ricevere dati da Google Apps Script
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
    const formData = await req.json()

    // Validazione dati minimi
    if (!formData.cliente || !formData.data) {
      return new Response(
        JSON.stringify({ error: 'Campi obbligatori mancanti: luogo di lavoro, data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validazione risorsa obbligatoria
    if (!formData.risorsa_nome) {
      return new Response(
        JSON.stringify({ error: 'Il campo "Risorsa" è obbligatorio. Inserisci nome e cognome.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepara i dati per l'inserimento
    const servizioData: {
      cliente: string
      data: string
      owner_email: string
      risorsa_id?: string
      risorsa_nome?: string
      ruolo_id?: string
      ruolo_nome?: string
      orario_inizio?: string
      orario_fine?: string
      paga?: number
      fee?: number
    } = {
      cliente: formData.cliente,
      data: formData.data,
      owner_email: tokenData.owner_email,
    }

    // Valida e cerca la risorsa (case-insensitive, obbligatoria)
    // Cerca la risorsa per nome (solo tra quelle dell'utente, case-insensitive)
    const { data: risorsa, error: risorsaError } = await supabase
      .from('risorse')
      .select('id, nome')
      .eq('owner_email', tokenData.owner_email)
      .ilike('nome', formData.risorsa_nome.trim())
      .single()

    if (risorsaError || !risorsa) {
      return new Response(
        JSON.stringify({ 
          error: 'Nome risorsa non registrato. Verifica di aver scritto correttamente nome e cognome.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Usa il nome esatto dal database (per gestire maiuscole/minuscole)
    servizioData.risorsa_id = risorsa.id
    servizioData.risorsa_nome = risorsa.nome

    if (formData.ruolo_nome) {
      // Cerca il ruolo per nome (solo tra quelli dell'utente)
      const { data: ruolo } = await supabase
        .from('ruoli')
        .select('id')
        .eq('ruolo', formData.ruolo_nome)
        .eq('owner_email', tokenData.owner_email)
        .single()

      if (ruolo) {
        servizioData.ruolo_id = ruolo.id
        servizioData.ruolo_nome = formData.ruolo_nome
      } else {
        // Se il ruolo non esiste, salva solo il nome (potrebbe essere un nuovo ruolo)
        servizioData.ruolo_nome = formData.ruolo_nome
      }
    }

    if (formData.orario_inizio) {
      servizioData.orario_inizio = formData.orario_inizio
    }

    if (formData.orario_fine) {
      servizioData.orario_fine = formData.orario_fine
    }

    // Calcola Paga e Fee se abbiamo ruolo_id e orari
    if (servizioData.ruolo_id && servizioData.orario_inizio && servizioData.orario_fine) {
      // Ottieni i dettagli del ruolo per calcolare paga e fee
      const { data: ruoloDetails } = await supabase
        .from('ruoli')
        .select('listino, fee_per_ora')
        .eq('id', servizioData.ruolo_id)
        .single()

      if (ruoloDetails && ruoloDetails.listino && ruoloDetails.fee_per_ora) {
        // Calcola durata in ore con precisione per le mezze ore
        // Estrai ore e minuti dagli orari
        const [oreInizio, minutiInizio] = servizioData.orario_inizio.split(':').map(Number)
        const [oreFine, minutiFine] = servizioData.orario_fine.split(':').map(Number)
        
        // Converti in minuti totali dalla mezzanotte
        const minutiTotaliInizio = oreInizio * 60 + minutiInizio
        let minutiTotaliFine = oreFine * 60 + minutiFine
        
        // Gestisci il caso in cui il servizio finisce dopo la mezzanotte
        if (minutiTotaliFine < minutiTotaliInizio) {
          // Il servizio finisce il giorno dopo (aggiungi 24 ore = 1440 minuti)
          minutiTotaliFine += 1440
        }
        
        // Calcola durata in minuti
        const durataMinuti = minutiTotaliFine - minutiTotaliInizio
        
        // Converti in ore (con precisione per le mezze ore)
        // Esempio: 30 minuti = 0.5 ore, 90 minuti = 1.5 ore
        const durataOre = durataMinuti / 60.0

        if (durataOre > 0) {
          // Calcola paga e fee (le mezze ore vengono pagate la metà)
          // Esempio: 0.5 ore * listino = metà paga, 0.5 ore * fee_per_ora = metà fee
          const paga = durataOre * parseFloat(ruoloDetails.listino)
          
          // Calcola fee (con riduzione del 50% per alcuni clienti)
          let fee = durataOre * parseFloat(ruoloDetails.fee_per_ora)
          const clientiRidotti = ['Nuova Arena', 'Pedevilla', 'Hosteria Della Musica']
          if (clientiRidotti.includes(servizioData.cliente)) {
            fee = fee * 0.5
          }
          
          // Arrotonda a 2 decimali (le mezze ore risultano in 0.5, 1.5, 2.5, ecc.)
          servizioData.paga = Math.round(paga * 100) / 100
          servizioData.fee = Math.round(fee * 100) / 100
        }
      }
    }

    // Inserisci il servizio
    const { data: servizio, error: insertError } = await supabase
      .from('servizi')
      .insert([servizioData])
      .select()
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

        // Aggiorna last_used_at e total_submissions del token SOLO se l'inserimento è riuscito
        const { data: currentToken } = await supabase
          .from('form_tokens')
          .select('total_submissions')
          .eq('token', token)
          .single()

        await supabase
          .from('form_tokens')
          .update({
            last_used_at: new Date().toISOString(),
            total_submissions: (currentToken?.total_submissions || 0) + 1,
          })
          .eq('token', token)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Servizio inserito con successo',
        id: servizio.id 
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

