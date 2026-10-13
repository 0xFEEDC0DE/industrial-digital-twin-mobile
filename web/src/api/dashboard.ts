import axios from 'axios'

export type PlantOverviewResponse = {
  plants: Array<any>
  summary: any
}

export async function fetchOverview(): Promise<PlantOverviewResponse> {
  const res = await axios.get('/api/dashboard/overview')
  return res.data
}
