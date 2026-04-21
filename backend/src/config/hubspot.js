import { Client } from '@hubspot/api-client'

if (!process.env.HUBSPOT_API_KEY) {
  console.warn('[HubSpot] HUBSPOT_API_KEY não configurada — integração CRM desativada.')
}

export const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY || '' })
