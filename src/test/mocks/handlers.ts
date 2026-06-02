import { http, HttpResponse } from 'msw'
import { listFixtures, itemFixtures } from './fixtures'

const SUPABASE_URL = 'http://localhost:54321'

export const handlers = [
  http.get(`${SUPABASE_URL}/rest/v1/lists`, () => {
    return HttpResponse.json(listFixtures)
  }),

  http.get(`${SUPABASE_URL}/rest/v1/items`, () => {
    return HttpResponse.json(itemFixtures)
  }),

  http.post(`${SUPABASE_URL}/rest/v1/items`, () => {
    return HttpResponse.json([itemFixtures[0]], { status: 201 })
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/items`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
