import type { Report } from './types';
import { apiGet, apiPostForm } from './client';

export function fetchReports() {
  return apiGet<Report[]>('/reports');
}

export function fetchReportById(id: string | number) {
  return apiGet<Report>(`/reports/${id}`);
}

export function createReport(formData: FormData) {
  return apiPostForm<Report>('/reports', formData);
}
