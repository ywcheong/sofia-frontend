import { api } from './client';
import type {
  GetCurrentPhaseResponse,
  Phase,
  TransitAvailabilityResponse,
  DeactivationAvailabilityResponse,
  TransitDeactivationRequest,
  TransitResponse,
  UserRetentionMode,
} from '@/types/api';

export function getCurrentPhase(): Promise<GetCurrentPhaseResponse> {
  return api.get<GetCurrentPhaseResponse>('/system-phase');
}

export function checkTransitAvailability(
  phase: Phase
): Promise<TransitAvailabilityResponse | DeactivationAvailabilityResponse> {
  return api.get<TransitAvailabilityResponse | DeactivationAvailabilityResponse>(
    `/system-phase/transit/${phase.toLowerCase()}/availability`
  );
}

export function transitToTranslation(): Promise<TransitResponse> {
  return api.post<TransitResponse>('/system-phase/transit/translation');
}

export function transitToSettlement(): Promise<TransitResponse> {
  return api.post<TransitResponse>('/system-phase/transit/settlement');
}

export function transitToRecruitment(): Promise<TransitResponse> {
  return api.post<TransitResponse>('/system-phase/transit/recruitment');
}

export function transitToDeactivation(userRetentionMode: UserRetentionMode): Promise<TransitResponse> {
  const request: TransitDeactivationRequest = { userRetentionMode };
  return api.post<TransitResponse>('/system-phase/transit/deactivation', request);
}
