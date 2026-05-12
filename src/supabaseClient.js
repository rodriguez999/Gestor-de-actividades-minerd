import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://npcjugutxngkdurmnckq.supabase.co'
const supabaseAnonKey = 'sb_publishable_qY1LxMh4ngPouzcRqrnBdg_9kthHYSe'

// Esta es la clave maestra que permite saltar los límites de correo
const supabaseServiceKey = 'sb_secret_O6E980vVjfMs6gFxWiFS9Q_s7y0vNNS' 

// Cliente estándar (para consultas normales)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Administrador (para crear usuarios sin enviar emails de confirmación)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})