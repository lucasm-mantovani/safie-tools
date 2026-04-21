import { supabaseAdmin } from '../config/supabase.js'

export const supabaseService = {
  async getProfileById(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateHubspotContactId(userId, hubspotContactId) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ hubspot_contact_id: hubspotContactId })
      .eq('id', userId)
    if (error) throw error
  },

  async createToolSession({ userId, toolSlug, inputData, outputData, qualificationData }) {
    const { data, error } = await supabaseAdmin
      .from('tool_sessions')
      .insert({
        user_id: userId,
        tool_slug: toolSlug,
        input_data: inputData,
        output_data: outputData,
        qualification_data: qualificationData,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
