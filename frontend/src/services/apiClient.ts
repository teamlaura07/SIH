import type { Incident, RescueTeam } from '../types/incident';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = {
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE_URL}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async createOrUpsertIncident(incident: Incident): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
    if (!res.ok) throw new Error('Failed to save incident to server');
    return res.json();
  },

  async batchSyncIncidents(incidents: Incident[]): Promise<Incident[]> {
    const res = await fetch(`${API_BASE_URL}/incidents/batch-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidents)
    });
    if (!res.ok) throw new Error('Batch sync failed');
    return res.json();
  },

  async updateIncidentStatus(incidentId: string, status: string, actor: string = "Control Room", note?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actor, note })
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  },

  async assignRescueTeam(incidentId: string, teamId: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, actor: 'Control Room Dispatcher' })
    });
    if (!res.ok) throw new Error('Failed to assign rescue team');
    return res.json();
  },

  async getRescueTeams(incidentId?: string): Promise<RescueTeam[]> {
    const url = incidentId 
      ? `${API_BASE_URL}/rescue-teams?incidentId=${incidentId}`
      : `${API_BASE_URL}/rescue-teams`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch rescue teams');
    return res.json();
  },

  async resetSimulation(): Promise<void> {
    await fetch(`${API_BASE_URL}/simulation/reset`, { method: 'POST' });
  }
};
