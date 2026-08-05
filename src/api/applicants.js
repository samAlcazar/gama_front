import { apiClient } from './client';

export const getApplicants = async () => {
  return apiClient('/applicants');
};

export const getApplicantById = async (id) => {
  return apiClient(`/applicants/${id}`);
};

export const createApplicant = async (applicantData) => {
  return apiClient('/applicants', {
    method: 'POST',
    body: JSON.stringify(applicantData),
  });
};
