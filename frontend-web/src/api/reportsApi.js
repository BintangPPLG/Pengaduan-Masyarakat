import client from './client';

export async function fetchReports() {
  const { data } = await client.get('/reports');
  return data;
}

export async function fetchReportById(id) {
  const { data } = await client.get(`/reports/${id}`);
  return data;
}

export async function createReport(formData) {
  const { data } = await client.post('/reports', formData);
  return data;
}

export async function updateReportStatus(id, status) {
  const { data } = await client.patch(`/reports/${id}/status`, { status });
  return data;
}

export async function updateReportStatusWithReason(id, status, rejected_reason) {
  const { data } = await client.patch(`/reports/${id}/status`, { status, rejected_reason });
  return data;
}

export async function deleteReport(id) {
  const { data } = await client.delete(`/reports/${id}`);
  return data;
}

export async function fetchStatsSummary() {
  const { data } = await client.get('/reports/_stats/summary');
  return data;
}
