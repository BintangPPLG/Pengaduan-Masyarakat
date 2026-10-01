import client from './client';

export async function fetchCommentsByReport(reportId) {
  const { data } = await client.get(`/comments/${reportId}`);
  return data;
}

export async function createComment(publicReportId, comment, parentId = null) {
  const { data } = await client.post('/comments', {
    public_report_id: publicReportId,
    comment,
    ...(parentId ? { parent_id: parentId } : {}),
  });
  return data;
}

export async function updateComment(id, comment) {
  const { data } = await client.put(`/comments/${id}`, { comment });
  return data;
}

export async function deleteComment(id) {
  const { data } = await client.delete(`/comments/${id}`);
  return data;
}
