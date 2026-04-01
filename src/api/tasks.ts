import { api, buildQueryString } from './client';
import type {
  PageTaskSummaryResponse,
  Pageable,
  CreateTaskRequest,
  CreateTaskResponse,
  ReportCompletionRequest,
  ReportCompletionResponse,
  ChangeAssigneeResponse,
  TaskType,
  AssignmentType,
  SortDirection,
} from '@/types/api';

export type SortField = 'id' | 'assignedAt' | 'completedAt' | 'characterCount';

interface GetTasksParams extends Pageable {
  search?: string;
  taskType?: TaskType;
  assignmentType?: AssignmentType;
  completed?: boolean;
  assigneeId?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export function getTasks(params: GetTasksParams): Promise<PageTaskSummaryResponse> {
  const query = buildQueryString({
    page: params.page,
    size: params.size,
    search: params.search,
    taskType: params.taskType,
    assignmentType: params.assignmentType,
    completed: params.completed,
    assigneeId: params.assigneeId,
    sortField: params.sortField,
    sortDirection: params.sortDirection,
  });
  return api.get<PageTaskSummaryResponse>(`/tasks${query}`);
}

export function createTask(body: CreateTaskRequest): Promise<CreateTaskResponse> {
  return api.post<CreateTaskResponse>('/tasks', body);
}

export function reportCompletion(
  taskId: string,
  body: ReportCompletionRequest
): Promise<ReportCompletionResponse> {
  return api.post<ReportCompletionResponse>(`/tasks/${taskId}/completion`, body);
}

export function downloadPerformanceReport(): Promise<Blob> {
  return api.get<Blob>('/tasks/csv', 'blob');
}

export function deleteTask(taskId: string): Promise<void> {
  return api.delete(`/tasks/${taskId}`);
}

export function changeAssignee(
  taskId: string,
  body: { newAssigneeId: string }
): Promise<ChangeAssigneeResponse> {
  return api.patch<ChangeAssigneeResponse>(`/tasks/${taskId}/assignee`, body);
}
