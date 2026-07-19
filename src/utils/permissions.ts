import type { Project, Role, UserRecord } from '../types/domain';

export type Permission =
  | 'create_project'
  | 'invite_users'
  | 'manage_workflow'
  | 'upload_files'
  | 'add_comments'
  | 'add_tasks'
  | 'batch_voice_updates'
  | 'export_reports'
  | 'view_settings';

type ProjectAccessPolicy = {
  canViewAssignedProjects: boolean;
  canViewAllProjects: boolean;
  canCreateProjects: boolean;
  canArchiveProjects: boolean;
  canDeleteProjects: boolean;
  canExportProject: boolean;
  canDuplicateProject: boolean;
};

type WorkflowPolicy = {
  canChangeStage: boolean;
  canChangeStatus: boolean;
  canChangeProgress: boolean;
  canMarkCompleted: boolean;
  canReopenCompletedProjects: boolean;
  canChangeTargetDates: boolean;
};

type CommunicationPolicy = {
  canCreateComments: boolean;
  canReply: boolean;
  canEditOwnComments: boolean;
  canDeleteOwnComments: boolean;
  canDeleteOthersComments: boolean;
  canAskQuestions: boolean;
  canAnswerQuestions: boolean;
  canCloseQuestions: boolean;
  canMentionUsers: boolean;
  canCreateInternalNotes: boolean;
};

type FilePolicy = {
  canUploadFiles: boolean;
  canDownloadFiles: boolean;
  canDeleteFiles: boolean;
  canReplaceFiles: boolean;
  allowedFileTypes: string[];
};

type TaskPolicy = {
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canCompleteTasks: boolean;
  canDeleteTasks: boolean;
  canReassignTasks: boolean;
};

type ReportsPolicy = {
  canViewReports: boolean;
  canExportReports: boolean;
  canCreateCustomReports: boolean;
  canScheduleReports: boolean;
};

type UserManagementPolicy = {
  canInviteUsers: boolean;
  canDisableUsers: boolean;
  canEditUsers: boolean;
  canResetPasswords: boolean;
};

type NotificationsPolicy = {
  receiveEmail: boolean;
  receiveInApp: boolean;
  receiveSms: boolean;
  receiveWhatsApp: boolean;
  notifyOn: Array<'question' | 'task' | 'project_updated' | 'stage_changed' | 'file_uploaded'>;
};

export type RolePolicy = {
  projectAccess: ProjectAccessPolicy;
  workflow: WorkflowPolicy;
  communication: CommunicationPolicy;
  files: FilePolicy;
  tasks: TaskPolicy;
  reports: ReportsPolicy;
  userManagement: UserManagementPolicy;
  notifications: NotificationsPolicy;
};

const operationalFileTypes = ['PDF', 'DOCX', 'XLSX', 'JPG', 'PNG', 'DWG', 'AI'];

export const rolePolicies: Record<Role, RolePolicy> = {
  colourpix_admin: {
    projectAccess: { canViewAssignedProjects: true, canViewAllProjects: true, canCreateProjects: true, canArchiveProjects: true, canDeleteProjects: true, canExportProject: true, canDuplicateProject: true },
    workflow: { canChangeStage: true, canChangeStatus: true, canChangeProgress: true, canMarkCompleted: true, canReopenCompletedProjects: true, canChangeTargetDates: true },
    communication: { canCreateComments: true, canReply: true, canEditOwnComments: true, canDeleteOwnComments: true, canDeleteOthersComments: true, canAskQuestions: true, canAnswerQuestions: true, canCloseQuestions: true, canMentionUsers: true, canCreateInternalNotes: true },
    files: { canUploadFiles: true, canDownloadFiles: true, canDeleteFiles: true, canReplaceFiles: true, allowedFileTypes: operationalFileTypes },
    tasks: { canCreateTasks: true, canAssignTasks: true, canCompleteTasks: true, canDeleteTasks: true, canReassignTasks: true },
    reports: { canViewReports: true, canExportReports: true, canCreateCustomReports: true, canScheduleReports: true },
    userManagement: { canInviteUsers: true, canDisableUsers: true, canEditUsers: true, canResetPasswords: true },
    notifications: { receiveEmail: true, receiveInApp: true, receiveSms: false, receiveWhatsApp: false, notifyOn: ['question', 'task', 'project_updated', 'stage_changed', 'file_uploaded'] },
  },
  psg_head_office: {
    projectAccess: { canViewAssignedProjects: true, canViewAllProjects: true, canCreateProjects: false, canArchiveProjects: false, canDeleteProjects: false, canExportProject: true, canDuplicateProject: false },
    workflow: { canChangeStage: true, canChangeStatus: true, canChangeProgress: true, canMarkCompleted: false, canReopenCompletedProjects: false, canChangeTargetDates: false },
    communication: { canCreateComments: true, canReply: true, canEditOwnComments: true, canDeleteOwnComments: false, canDeleteOthersComments: false, canAskQuestions: true, canAnswerQuestions: false, canCloseQuestions: false, canMentionUsers: true, canCreateInternalNotes: false },
    files: { canUploadFiles: true, canDownloadFiles: true, canDeleteFiles: false, canReplaceFiles: false, allowedFileTypes: operationalFileTypes },
    tasks: { canCreateTasks: true, canAssignTasks: false, canCompleteTasks: true, canDeleteTasks: false, canReassignTasks: false },
    reports: { canViewReports: true, canExportReports: true, canCreateCustomReports: false, canScheduleReports: false },
    userManagement: { canInviteUsers: false, canDisableUsers: false, canEditUsers: false, canResetPasswords: false },
    notifications: { receiveEmail: true, receiveInApp: true, receiveSms: false, receiveWhatsApp: false, notifyOn: ['question', 'task', 'project_updated', 'stage_changed', 'file_uploaded'] },
  },
  psg_branch_manager: {
    projectAccess: { canViewAssignedProjects: true, canViewAllProjects: false, canCreateProjects: false, canArchiveProjects: false, canDeleteProjects: false, canExportProject: true, canDuplicateProject: false },
    workflow: { canChangeStage: false, canChangeStatus: false, canChangeProgress: false, canMarkCompleted: false, canReopenCompletedProjects: false, canChangeTargetDates: false },
    communication: { canCreateComments: false, canReply: true, canEditOwnComments: true, canDeleteOwnComments: false, canDeleteOthersComments: false, canAskQuestions: true, canAnswerQuestions: false, canCloseQuestions: false, canMentionUsers: true, canCreateInternalNotes: false },
    files: { canUploadFiles: true, canDownloadFiles: true, canDeleteFiles: false, canReplaceFiles: false, allowedFileTypes: operationalFileTypes },
    tasks: { canCreateTasks: false, canAssignTasks: false, canCompleteTasks: false, canDeleteTasks: false, canReassignTasks: false },
    reports: { canViewReports: true, canExportReports: true, canCreateCustomReports: false, canScheduleReports: false },
    userManagement: { canInviteUsers: false, canDisableUsers: false, canEditUsers: false, canResetPasswords: false },
    notifications: { receiveEmail: true, receiveInApp: true, receiveSms: false, receiveWhatsApp: false, notifyOn: ['question', 'project_updated', 'stage_changed', 'file_uploaded'] },
  },
  sign_company: {
    projectAccess: { canViewAssignedProjects: true, canViewAllProjects: false, canCreateProjects: false, canArchiveProjects: false, canDeleteProjects: false, canExportProject: true, canDuplicateProject: false },
    workflow: { canChangeStage: true, canChangeStatus: false, canChangeProgress: true, canMarkCompleted: false, canReopenCompletedProjects: false, canChangeTargetDates: false },
    communication: { canCreateComments: true, canReply: true, canEditOwnComments: true, canDeleteOwnComments: false, canDeleteOthersComments: false, canAskQuestions: false, canAnswerQuestions: false, canCloseQuestions: false, canMentionUsers: true, canCreateInternalNotes: false },
    files: { canUploadFiles: true, canDownloadFiles: true, canDeleteFiles: false, canReplaceFiles: false, allowedFileTypes: operationalFileTypes },
    tasks: { canCreateTasks: true, canAssignTasks: false, canCompleteTasks: true, canDeleteTasks: false, canReassignTasks: false },
    reports: { canViewReports: false, canExportReports: false, canCreateCustomReports: false, canScheduleReports: false },
    userManagement: { canInviteUsers: false, canDisableUsers: false, canEditUsers: false, canResetPasswords: false },
    notifications: { receiveEmail: true, receiveInApp: true, receiveSms: false, receiveWhatsApp: false, notifyOn: ['task', 'project_updated', 'stage_changed', 'file_uploaded'] },
  },
};

const permissionCapabilities: Record<Permission, (policy: RolePolicy) => boolean> = {
  create_project: (policy) => policy.projectAccess.canCreateProjects,
  invite_users: (policy) => policy.userManagement.canInviteUsers,
  manage_workflow: (policy) => policy.workflow.canChangeStage || policy.workflow.canChangeStatus || policy.workflow.canChangeProgress,
  upload_files: (policy) => policy.files.canUploadFiles,
  add_comments: (policy) => policy.communication.canCreateComments,
  add_tasks: (policy) => policy.tasks.canCreateTasks,
  batch_voice_updates: (policy) => policy.communication.canCreateInternalNotes && policy.workflow.canChangeStage,
  export_reports: (policy) => policy.reports.canViewReports,
  view_settings: (policy) => policy.userManagement.canEditUsers || policy.userManagement.canInviteUsers,
};

export function getRolePolicy(user: UserRecord | null | undefined) {
  return user ? rolePolicies[user.role] : null;
}

export function can(user: UserRecord | null | undefined, permission: Permission) {
  const policy = getRolePolicy(user);
  return Boolean(policy && permissionCapabilities[permission](policy));
}

export function canAccessRoute(user: UserRecord | null | undefined, path: string) {
  if (!user) {
    return false;
  }

  if (path.startsWith('/users')) {
    return can(user, 'invite_users');
  }

  if (path.startsWith('/reports')) {
    return can(user, 'export_reports');
  }

  if (path.startsWith('/voice-updates')) {
    return can(user, 'batch_voice_updates');
  }

  if (path.startsWith('/settings')) {
    return can(user, 'view_settings');
  }

  return true;
}

export function canViewProject(user: UserRecord | null | undefined, project: Project) {
  if (!user) {
    return false;
  }

  if (!user.canAccessAllWorkspaces && !user.workspaceIds?.includes('*') && !user.workspaceIds?.includes(project.workspaceId)) {
    return false;
  }

  const policy = rolePolicies[user.role].projectAccess;

  if (policy.canViewAllProjects) {
    return true;
  }

  if (!policy.canViewAssignedProjects) {
    return false;
  }

  if (user.role === 'psg_branch_manager') {
    return Boolean(user.branch && project.branch.toLowerCase() === user.branch.toLowerCase());
  }

  return project.installer.toLowerCase() === user.name.toLowerCase() || project.installer.toLowerCase() === user.branch?.toLowerCase();
}

export function filterProjectsForUser(projects: Project[], user: UserRecord | null | undefined) {
  return projects.filter((project) => canViewProject(user, project));
}

export function canChangeProjectStage(user: UserRecord | null | undefined, project: Project, nextStage: Project['currentStage']) {
  const policy = getRolePolicy(user);
  if (!user || !policy?.workflow.canChangeStage || !canViewProject(user, project)) {
    return false;
  }

  if (nextStage === project.currentStage) {
    return true;
  }

  if (project.currentStage === 'Completed' && !policy.workflow.canReopenCompletedProjects) {
    return false;
  }

  if (nextStage === 'Completed' && !policy.workflow.canMarkCompleted) {
    return false;
  }

  if (user.role === 'sign_company') {
    const installerTransitions: Partial<Record<Project['currentStage'], Project['currentStage'][]>> = {
      Production: ['Installation Scheduled'],
      'Installation Scheduled': ['Installation In Progress'],
      'Installation In Progress': ['Installed'],
    };

    return installerTransitions[project.currentStage]?.includes(nextStage) ?? false;
  }

  if (user.role === 'psg_head_office') {
    const psgApprovalStages: Project['currentStage'][] = ['Artwork Sent', 'Awaiting Approval', 'Approved', 'Artwork In Progress'];
    return psgApprovalStages.includes(project.currentStage) && psgApprovalStages.includes(nextStage);
  }

  return true;
}

export function getAllowedStageOptions(user: UserRecord | null | undefined, project: Project, stages: readonly Project['currentStage'][]) {
  return stages.filter((stage) => stage === project.currentStage || canChangeProjectStage(user, project, stage));
}

export function getWorkflowDenialReason(user: UserRecord | null | undefined, project: Project, next: { currentStage: Project['currentStage']; status: Project['status']; progress: number }) {
  const policy = getRolePolicy(user);

  if (!user || !policy) {
    return 'Sign in before changing workflow details.';
  }

  if (!canViewProject(user, project)) {
    return 'Your role can only update projects assigned to you.';
  }

  if (next.currentStage !== project.currentStage && !canChangeProjectStage(user, project, next.currentStage)) {
    if (user.role === 'sign_company') {
      return 'Installers may only move projects from Production to Installation Scheduled, then Installation In Progress, then Installed.';
    }

    if (user.role === 'psg_head_office') {
      return 'PSG Head Office may only move artwork approval stages. Colourpix can perform broader workflow changes.';
    }

    return 'Your role cannot change this project stage. Colourpix administrators can override workflow rules.';
  }

  if (next.status !== project.status && !policy.workflow.canChangeStatus) {
    return 'Your role cannot change project status. Ask Colourpix to update the status.';
  }

  if (next.progress !== project.progress && !policy.workflow.canChangeProgress) {
    return 'Your role cannot change project progress. Ask Colourpix to update progress.';
  }

  return null;
}

export function canApplyWorkflowChange(user: UserRecord | null | undefined, project: Project, next: { currentStage: Project['currentStage']; status: Project['status']; progress: number }) {
  return getWorkflowDenialReason(user, project, next) === null;
}