// API Types based on openapi.json

export type Phase = 'DEACTIVATION' | 'RECRUITMENT' | 'TRANSLATION' | 'SETTLEMENT';

export type Role = 'STUDENT' | 'ADMIN';

export type TaskType = 'GAONNURI_POST' | 'EXTERNAL_POST';

export type SortDirection = 'ASC' | 'DESC';

export type UserSortField =
  | 'id'
  | 'studentNumber'
  | 'studentName'
  | 'role'
  | 'rest'
  | 'warningCount'
  | 'totalCharCount';

export type AssignmentType = 'AUTOMATIC' | 'MANUAL';

// Response Types
export interface GetCurrentPhaseResponse {
  currentPhase: Phase;
  currentPhaseDisplayName: string;
  nextPhase: Phase;
  nextPhaseDisplayName: string;
}

export interface TransitPhaseRequest {
  nextPhase: Phase;
}

export interface TransitPhaseResponse {
  currentPhase: Phase;
  currentPhaseDisplayName: string;
}

export interface UserSummaryResponse {
  id: string;
  studentNumber: string;
  studentName: string;
  role: Role;
  rest: boolean;
  warningCount: number;
  completedCharCount: number;
  adjustedCharCount: number;
  totalCharCount: number;
}

export interface PageUserSummaryResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: UserSummaryResponse[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TaskSummaryResponse {
  id: string;
  taskType: TaskType;
  taskDescription: string;
  assigneeId: string | null;
  assigneeStudentNumber: string | null;
  assigneeName: string | null;
  assignmentType: AssignmentType;
  assignedAt: string | null;
  completedAt: string | null;
  characterCount: number | null;
  completed: boolean;
  late: boolean;
  remindedAt: string | null;
}

export interface PageTaskSummaryResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: TaskSummaryResponse[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface RegistrationSummaryResponse {
  id: string;
  studentNumber: string;
  studentName: string;
}

export interface PageRegistrationSummaryResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: RegistrationSummaryResponse[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EntryResponse {
  id: string;
  koreanTerm: string;
  englishTerm: string;
}

export interface GlossaryCreateRequest {
  koreanTerm: string;
  englishTerm: string;
}

export interface GlossaryUpdateRequest {
  koreanTerm: string;
  englishTerm: string;
}

export interface GlossaryAutoMapRequest {
  text: string;
}

export interface GlossaryAutoMapResponse {
  koreanTerm: string;
  englishTerm: string;
}

// Auth
export interface AuthCheckResponse {
  userId: string;
  userStudentNumber: string;
  userStudentName: string;
}

export interface AuthUser {
  userId: string;
  userStudentNumber: string;
  userStudentName: string;
}

// Request Types
export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface UsersFilter {
  search?: string;
  role?: Role;
  rest?: boolean;
  sortField?: UserSortField;
  sortDirection?: SortDirection;
}

// User Management Request/Response Types
export interface SetRestStatusRequest {
  rest: boolean;
}

export interface SetRestStatusResponse {
  userId: string;
  rest: boolean;
}

export interface AdjustCharCountRequest {
  amount: number;
}

export interface AdjustCharCountResponse {
  userId: string;
  amount: number;
  adjustedCharCount: number;
}

export interface PromoteToAdminResponse {
  userId: string;
  role: Role;
}

export interface DemoteFromAdminResponse {
  userId: string;
  role: Role;
}

// Task Management Request/Response Types
export interface CreateTaskRequest {
  taskType: TaskType;
  taskDescription: string;
  assignmentType: AssignmentType;
  assigneeId?: string;
}

export interface CreateTaskResponse {
  taskId: string;
  assigneeId: string | null;
  assigneeStudentNumber: string | null;
  assigneeName: string | null;
}

export interface ReportCompletionRequest {
  characterCount: number;
}

export interface ReportCompletionResponse {
  taskId: string;
  late: boolean;
}

export interface ChangeAssigneeResponse {
  taskId: string;
  newAssigneeId: string;
  newAssigneeStudentNumber: string;
  newAssigneeName: string;
}

// Transit Phase Types
export type UserRetentionMode = 'KEEP_ALL' | 'KEEP_ADMINS' | 'KEEP_SELF';

export interface PendingRegistrationResponse {
  id: string;
  studentNumber: string;
  studentName: string;
}

export interface IncompleteTaskResponse {
  id: string;
  taskType: string;
  description: string;
  assigneeName: string;
}

export interface TransitAvailabilityResponse {
  available: boolean;
  pendingRegistrations: PendingRegistrationResponse[];
  incompleteTasks: IncompleteTaskResponse[];
}

export interface DeactivationAvailabilityResponse {
  available: boolean;
}

export interface TransitDeactivationRequest {
  userRetentionMode: UserRetentionMode;
}

export interface TransitResponse {
  currentPhase: Phase;
  currentPhaseDisplayName: string;
}
