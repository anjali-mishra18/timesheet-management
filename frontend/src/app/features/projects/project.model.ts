export interface Project {
  id?: number;
  code: string;
  name: string;
  client: string;
  isBillable: boolean;
  status: string;
  assignedEmployee: string;
  startDate: string;
  endDate: string;
}
