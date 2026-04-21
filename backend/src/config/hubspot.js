import { Client } from '@hubspot/api-client'

if (!process.env.HUBSPOT_API_KEY) {
  throw new Error('HUBSPOT_API_KEY não configurada')
}

export const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY })
