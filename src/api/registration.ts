import { api, buildQueryString } from './client';
import type { PageRegistrationSummaryResponse, Pageable } from '@/types/api';

export function getRegistrations(params: Pageable): Promise<PageRegistrationSummaryResponse> {
  const query = buildQueryString({
    page: params.page,
    size: params.size,
  });
  return api.get<PageRegistrationSummaryResponse>(`/user/registrations${query}`);
}

export function acceptRegistration(id: string): Promise<void> {
  return api.post(`/user/registrations/${id}/acceptance`, undefined, 'void');
}

export function rejectRegistration(id: string): Promise<void> {
  return api.post(`/user/registrations/${id}/rejection`, undefined, 'void');
}
