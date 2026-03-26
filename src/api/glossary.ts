import { api, buildQueryString } from './client';
import type {
  EntryResponse,
  GlossaryCreateRequest,
  GlossaryUpdateRequest,
  GlossaryAutoMapRequest,
  GlossaryAutoMapResponse,
} from '@/types/api';

export function getGlossaryEntries(keyword?: string): Promise<EntryResponse[]> {
  const query = buildQueryString({ keyword });
  return api.get<EntryResponse[]>(`/glossary${query}`);
}

export function createGlossaryEntry(
  request: GlossaryCreateRequest
): Promise<EntryResponse> {
  return api.post<EntryResponse>('/glossary', request);
}

export function updateGlossaryEntry(
  id: string,
  request: GlossaryUpdateRequest
): Promise<EntryResponse> {
  return api.put<EntryResponse>(`/glossary/${id}`, request);
}

export function deleteGlossaryEntry(id: string): Promise<void> {
  return api.delete(`/glossary/${id}`);
}

export function glossaryAutoMap(
  request: GlossaryAutoMapRequest
): Promise<GlossaryAutoMapResponse[]> {
  return api.post<GlossaryAutoMapResponse[]>('/glossary/auto-map', request);
}
