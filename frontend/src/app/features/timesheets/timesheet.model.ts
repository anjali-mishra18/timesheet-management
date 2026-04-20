export interface Timesheet {
  id?: number;
  date: string;
  projectCode: string;
  hours: number;
  status: string;
  description: string;
  employee: string;
  managerComment?: string;
}
