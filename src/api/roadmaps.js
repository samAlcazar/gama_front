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
