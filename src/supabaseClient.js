import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://npcjugutxngkdurmnckq.supabase.co'
const supabaseAnonKey = 'sb_publishable_qY1LxMh4ngPouzcRqrnBdg_9kthHYSe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)