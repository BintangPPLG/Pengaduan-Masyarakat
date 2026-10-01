import type { Comment } from './types';
import { apiDelete, apiGet, apiPostJson, apiPutJson } from './client';

export function fetchCommentsByReport(reportId: string | number) {
  return apiGet<Comment[]>(`/comments/${reportId}`);
}

export function createComment(publicReportId: number, comment: string, parentId?: number) {
  return apiPostJson<unknown>('/comments', {
    public_report_id: publicReportId,
    comment,
    ...(parentId ? { parent_id: parentId } : {}),
  });
}

export function updateComment(id: number, comment: string) {
  return apiPutJson<unknown>(`/comments/${id}`, { comment });
}

export function deleteComment(id: number) {
  return apiDelete<unknown>(`/comments/${id}`);
}
