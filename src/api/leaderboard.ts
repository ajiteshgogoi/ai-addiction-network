import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(10)
    
  if (error) throw error
  return data
}

export async function addScore(name: string, score: number) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ name, score }])
      
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    console.log('Score added successfully:', data)
    return data
  } catch (err) {
    console.error('Error adding score:', err)
    throw err
  }
}
