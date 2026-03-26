import { api, buildQueryString } from './client';
import type {
  PageUserSummaryResponse,
  Pageable,
  UsersFilter,
  SetRestStatusRequest,
  SetRestStatusResponse,
  AdjustCharCountRequest,
  AdjustCharCountResponse,
  PromoteToAdminResponse,
  DemoteFromAdminResponse,
} from '@/types/api';

export function getUsers(
  params: Pageable,
  filter?: UsersFilter
): Promise<PageUserSummaryResponse> {
  const query = buildQueryString({
    page: params.page,
    size: params.size,
    search: filter?.search,
    role: filter?.role,
    rest: filter?.rest,
    sortField: filter?.sortField,
    sortDirection: filter?.sortDirection,
  });
  return api.get<PageUserSummaryResponse>(`/users${query}`);
}

export function setRestStatus(
  userId: string,
  body: SetRestStatusRequest
): Promise<SetRestStatusResponse> {
  return api.post<SetRestStatusResponse>(`/users/${userId}/rest`, body);
}

export function adjustCharCount(
  userId: string,
  body: AdjustCharCountRequest
): Promise<AdjustCharCountResponse> {
  return api.post<AdjustCharCountResponse>(`/users/${userId}/adjust-char-count`, body);
}

export function promoteToAdmin(userId: string): Promise<PromoteToAdminResponse> {
  return api.post<PromoteToAdminResponse>(`/users/${userId}/promote`);
}

export function demoteFromAdmin(userId: string): Promise<DemoteFromAdminResponse> {
  return api.post<DemoteFromAdminResponse>(`/users/${userId}/demote`);
}
