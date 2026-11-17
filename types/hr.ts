// types/hr.ts
export type HrNavTab = 'dashboard' | 'employees' | 'old-employees' | 'benefits';

export interface ProjectItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface EmployeeCardItem {
  id: string;
  empCode: string;
  name: string;
  nickname: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: string;
  position: string;
  department: string;
  employmentType: string;
  status: 'active' | 'probation' | string;
  startDate: string;
  skills: string[];
  notes?: string;
  tenure: string;
  salary: number;
  projects: ProjectItem[];
}

export interface FormerEmployeeItem {
  id: string;
  empCode: string;
  name: string;
  nickname?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  position: string;
  department: string;
  employmentType?: string;
  startDate: string;
  resignDate: string;
  reason: string;
  tenure?: string;
  skills?: string[];
  projects?: ProjectItem[];
}

export interface BenefitItem {
  id: string;
  refNo: string;
  date: string;
  empCode: string;
  empName: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved';
}
