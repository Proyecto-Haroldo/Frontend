import { apiClient } from './apiClient';
import type { CreateSchedulePayload, ScheduleRow } from '../core/types/schedule';

export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Default window: first day of current month through today + 90 days (matches backend default spirit). */
export function defaultScheduleRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now);
  to.setDate(to.getDate() + 90);
  return { from: toIsoDateLocal(from), to: toIsoDateLocal(to) };
}

export async function fetchMySchedules(from: string, to: string): Promise<ScheduleRow[]> {
  const { data } = await apiClient.get<ScheduleRow[]>('schedules/my', {
    params: { from, to },
  });
  return data;
}

export async function createSchedule(payload: CreateSchedulePayload): Promise<ScheduleRow> {
  const { data } = await apiClient.post<ScheduleRow>('schedules', payload);
  return data;
}
