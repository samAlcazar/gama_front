import { apiClient } from './client';

export const getRoadmaps = async () => {
  return apiClient('/roadmaps');
};

export const getInbox = async () => {
  return apiClient('/roadmaps/inbox');
};

export const getRoadmapById = async (id) => {
  return apiClient(`/roadmaps/${id}`);
};

export const createRoadmap = async (roadmapData) => {
  return apiClient('/roadmaps', {
    method: 'POST',
    body: JSON.stringify(roadmapData),
  });
};

export const deriveRoadmap = async (id, movementData) => {
  return apiClient(`/roadmaps/${id}/movements`, {
    method: 'POST',
    body: JSON.stringify(movementData),
  });
};

export const updateRoadmapStatus = async (id, status) => {
  return apiClient(`/roadmaps/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const getAttachments = async (roadmapId) => {
  return apiClient(`/roadmaps/${roadmapId}/attachments`);
};

export const uploadAttachment = async (roadmapId, formData) => {
  const token = localStorage.getItem('gama_jwt_token');
  const response = await fetch(`http://localhost:8080/api/v1/roadmaps/${roadmapId}/attachments`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al subir el anexo escaneado');
  }
  return data;
};

export const fetchAttachmentBlobUrl = async (roadmapId, attachmentId) => {
  const token = localStorage.getItem('gama_jwt_token');
  const response = await fetch(`http://localhost:8080/api/v1/roadmaps/${roadmapId}/attachments/${attachmentId}/file`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Error al obtener archivo');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const deleteAttachment = async (roadmapId, attachmentId) => {
  return apiClient(`/roadmaps/${roadmapId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

