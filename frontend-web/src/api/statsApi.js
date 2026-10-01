import client from './client';

export async function fetchAdvancedStats() {
  const { data } = await client.get('/reports/_stats/advanced');
  return data;
}

export async function exportReportsPdf({ dateFrom, dateTo, status, category_id } = {}) {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  if (status && status !== 'all') params.append('status', status);
  if (category_id) params.append('category_id', category_id);

  const { data } = await client.get(`/export/reports/pdf?${params}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-pengaduan-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
