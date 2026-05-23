export interface ScheduleRow {
  id: number;
  advisorId: number;
  clientId: number;
  advisorEmail: string;
  clientEmail: string;
  clientType: string;
  serviceType: string;
  date: string;
  time: string;
  modality: string;
  additionalNotes: string | null;
  status: string;
  meetLink: string | null;
}

export interface CreateSchedulePayload {
  clientType: string;
  serviceType: string;
  date: string;
  time: string;
  modality: string;
  additionalNotes?: string | null;
  advisorId: number;
  clientId: number;
}
