const REMINDER_DAYS = 25;

export interface DeletionRequest {
  user_id: string;
  requested_at: string;
  scheduled_delete_at: string;
  notified_at?: string | null;
}

export function isEligibleForReminder(req: DeletionRequest): boolean {
  if (req.notified_at) return false;
  const reminderAt = new Date(req.requested_at).getTime() + REMINDER_DAYS * 86400000;
  return reminderAt <= Date.now();
}

export function isEligibleForDeletion(req: DeletionRequest): boolean {
  return new Date(req.scheduled_delete_at).getTime() <= Date.now();
}
