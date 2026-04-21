import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Timesheet } from './features/timesheets/timesheet.model';
import { Project } from './features/projects/project.model';

interface WeeklyGroup {
  weekRange: string;
  projectCode: string;
  description: string;
  status: string;
  id?: number;
  ids?: number[]; // For bulk actions
  employeeName?: string;
  totalHours?: number;
  managerComment?: string;
  hours: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number; }
}

import { AuthFeatureModule } from './features/auth/auth.module';
import { TimesheetsFeatureModule } from './features/timesheets/timesheets.module';
import { ProjectsFeatureModule } from './features/projects/projects.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, AuthFeatureModule, TimesheetsFeatureModule, ProjectsFeatureModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5254/api';

  role = signal('Employee'); // 'Employee' or 'Manager'
  activeTab = signal('dashboard');
  
  // Authentication State
  isAuthenticated = signal(false);
  loginRoleContext = signal<'Employee'|'Manager'|null>(null);
  loginUsername = signal('emp_charlie');
  loginPassword = signal('password123');
  loggedInFullName = signal('');

  // Custom Alert System
  customAlertMessage = signal('');
  alertType = signal<'success'|'error'>('success');

  // Shared Data
  projects = signal<Project[]>([]);
  timesheets = signal<Timesheet[]>([]);

  ngOnInit() {
    // Only fetch data if authenticated, handled post-login instead.
  }

  doLogin() {
    if (!this.loginUsername() || !this.loginPassword()) {
      this.showAlert('Error: Username and Password required.');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/auth/login`, {
      username: this.loginUsername(),
      password: this.loginPassword(),
      loginRole: this.loginRoleContext()
    }).subscribe({
      next: (res) => {
        this.isAuthenticated.set(true);
        this.role.set(res.role);
        this.loggedInFullName.set(res.fullName);
        this.activeTab.set(res.role === 'Employee' ? 'dashboard' : 'approvals');
        this.fetchProjects();
        this.fetchTimesheets();
      },
      error: (err) => {
        this.loginPassword.set('');
        this.showAlert(err.error?.message || 'Incorrect details. Please ensure you clicked the right role.');
      }
    });
  }

  logout() {
    this.isAuthenticated.set(false);
    this.loginRoleContext.set(null);
    this.loginPassword.set('');
  }

  fetchProjects() {
    this.http.get<Project[]>(`${this.apiUrl}/projects`).subscribe(res => {
      this.projects.set(res);
    });
  }

  fetchTimesheets() {
    // In actual implementation, EF might return an empty list initially because it uses an InMemory database on memory start.
    this.http.get<Timesheet[]>(`${this.apiUrl}/timesheet`).subscribe(res => {
      this.timesheets.set(res);
    });
  }

  // Modal Visibilities
  showTimesheetModal = signal(false);
  showProjectModal = signal(false);
  showRejectModal = signal(false);

  // Form States - Timesheet (Weekly)
  tProject = signal('');
  tDate = signal('');
  tMon = signal<number | null>(null);
  tTue = signal<number | null>(null);
  tWed = signal<number | null>(null);
  tThu = signal<number | null>(null);
  tFri = signal<number | null>(null);
  tSat = signal<number | null>(null);
  tSun = signal<number | null>(null);
  tDesc = signal('');

  // Form States - Project
  editProjectId = signal<number | null>(null);
  pCode = signal('');
  pName = signal('');
  pClient = signal('');
  pBillable = signal(true);
  pAssignee = signal('');
  pStartDate = signal('');
  pEndDate = signal('');

  // Dropdown list for project assignments (Mapping our C# seeds)
  employeeList = ['Charlie Brown', 'Diana Prince'];

  // Form States - Reject
  rejectComment = signal('');
  rejectActionIds = signal<number[]>([]);

  // Editing State
  editingWeekIds = signal<number[]>([]);

  activeProjects = computed(() => this.projects().filter(p => p.status === 'Active'));
  
  // Computeds - Reports Filters
  filterStartDate = signal('');
  filterEndDate = signal('');
  
  // Computeds - Employee
  myAssignedProjects = computed(() => this.activeProjects().filter(p => p.assignedEmployee === this.loggedInFullName()));
  employeeTimesheets = computed(() => this.timesheets().filter(t => t.employee === this.loggedInFullName()));
  
  // Logic to group daily records into a weekly view for horizontal display
  groupedTimesheets = computed<WeeklyGroup[]>(() => {
    const groups: { [key: string]: WeeklyGroup } = {};
    const list = this.employeeTimesheets();
    
    for (const t of list) {
      const dt = new Date(t.date);
      const day = dt.getUTCDay();
      const diff = dt.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monDate = new Date(dt.setUTCDate(diff));
      const mon = monDate.toISOString().split('T')[0];

      const key = `${t.projectCode}-${mon}`;
      
      if (!groups[key]) {
        const sunDate = new Date(monDate);
        sunDate.setUTCDate(sunDate.getUTCDate() + 6);
        const sun = sunDate.toISOString().split('T')[0];

        groups[key] = {
          weekRange: `${mon} to ${sun}`,
          projectCode: t.projectCode,
          description: t.description,
          status: t.status,
          managerComment: t.managerComment,
          ids: [],
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        };
      }
      
      groups[key].ids?.push(t.id!);
      // Ensure we capture the comment if it exists in any of the entries in the group
      if (t.managerComment) groups[key].managerComment = t.managerComment;
      
      const dayIndex = new Date(t.date).getUTCDay();
      const dayMap: { [key: number]: keyof WeeklyGroup['hours'] } = { 1:'mon', 2:'tue', 3:'wed', 4:'thu', 5:'fri', 6:'sat', 0:'sun' };
      const dayKey = dayMap[dayIndex];
      if (dayKey) {
        groups[key].hours[dayKey] = t.hours;
      }
    }
    
    return Object.values(groups);
  });

  totalEmployeeHours = computed(() => this.employeeTimesheets().reduce((sum, t) => sum + t.hours, 0));

  // Computeds - Manager
  pendingTimesheets = computed(() => this.timesheets().filter(t => t.status === 'Submitted'));
  
  groupedPendingTimesheets = computed<WeeklyGroup[]>(() => {
    const groups: { [key: string]: WeeklyGroup } = {};
    const list = this.pendingTimesheets();
    
    for (const t of list) {
      const dt = new Date(t.date);
      const day = dt.getUTCDay();
      const diff = dt.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monDate = new Date(dt.setUTCDate(diff));
      const mon = monDate.toISOString().split('T')[0];

      // Key includes employee for manager view
      const key = `${t.employee}-${t.projectCode}-${mon}`;
      
      if (!groups[key]) {
        const sunDate = new Date(monDate);
        sunDate.setUTCDate(sunDate.getUTCDate() + 6);
        const sun = sunDate.toISOString().split('T')[0];

        groups[key] = {
          weekRange: `${mon} to ${sun}`,
          employeeName: t.employee,
          projectCode: t.projectCode,
          description: t.description,
          status: t.status,
          ids: [],
          totalHours: 0,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        };
      }
      
      groups[key].ids?.push(t.id!);
      groups[key].totalHours! += t.hours;

      const dayIndex = new Date(t.date).getUTCDay();
      const dayMap: { [key: number]: keyof WeeklyGroup['hours'] } = { 1:'mon', 2:'tue', 3:'wed', 4:'thu', 5:'fri', 6:'sat', 0:'sun' };
      const dayKey = dayMap[dayIndex];
      if (dayKey) {
        groups[key].hours[dayKey] = t.hours;
      }
    }
    
    return Object.values(groups);
  });
  
  // Reports Computeds (Manager)
  projectWiseReport = computed(() => {
    const report: any = {};
    for (const t of this.timesheets()) {
      if (this.filterStartDate() && t.date < this.filterStartDate()) continue;
      if (this.filterEndDate() && t.date > this.filterEndDate()) continue;
      if (!report[t.projectCode]) report[t.projectCode] = 0;
      if (t.status === 'Approved') report[t.projectCode] += t.hours;
    }
    return Object.keys(report).map(k => ({ code: k, hours: report[k] }));
  });

  employeeWiseReport = computed(() => {
    const report: any = {};
    for (const t of this.timesheets()) {
      if (this.filterStartDate() && t.date < this.filterStartDate()) continue;
      if (this.filterEndDate() && t.date > this.filterEndDate()) continue;
      if (!report[t.employee]) report[t.employee] = 0;
      if (t.status === 'Approved') report[t.employee] += t.hours;
    }
    return Object.keys(report).map(k => ({ emp: k, hours: report[k] }));
  });

  billingReport = computed(() => {
    let billable = 0;
    let nonBillable = 0;
    const projectMap = new Map(this.projects().map(p => [p.code, p]));
    
    for (const t of this.timesheets()) {
      if (this.filterStartDate() && t.date < this.filterStartDate()) continue;
      if (this.filterEndDate() && t.date > this.filterEndDate()) continue;
      
      if (t.status === 'Approved') {
        const p = projectMap.get(t.projectCode);
        if (p && p.isBillable) billable += t.hours;
        else nonBillable += t.hours;
      }
    }
    return { billable, nonBillable };
  });

  // Actions
  // Toggle Role removed as we now have hard DB roles. Left for generic tabs.
  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Custom Alert helper
  showAlert(msg: string, type: 'success'|'error' = 'error') {
    this.alertType.set(type);
    this.customAlertMessage.set(msg);
    setTimeout(() => this.customAlertMessage.set(''), 3500);
  }

  // --- Timesheet Creation (Employee) ---
  openNewTimesheet() {
    this.editingWeekIds.set([]);
    this.closeTimesheetModal(); // reset
    this.showTimesheetModal.set(true);
  }

  editTimesheet(g: WeeklyGroup) {
    this.editingWeekIds.set(g.ids || []);
    this.tProject.set(g.projectCode);
    this.tDate.set(g.weekRange.split(' to ')[0]);
    this.tDesc.set(g.description);
    this.tMon.set(g.hours.mon || null);
    this.tTue.set(g.hours.tue || null);
    this.tWed.set(g.hours.wed || null);
    this.tThu.set(g.hours.thu || null);
    this.tFri.set(g.hours.fri || null);
    this.tSat.set(g.hours.sat || null);
    this.tSun.set(g.hours.sun || null);
    this.showTimesheetModal.set(true);
  }

  closeTimesheetModal() {
    this.showTimesheetModal.set(false);
    this.editingWeekIds.set([]);
    this.tProject.set(''); this.tDate.set(''); this.tDesc.set('');
    this.tMon.set(null); this.tTue.set(null); this.tWed.set(null); 
    this.tThu.set(null); this.tFri.set(null); this.tSat.set(null); this.tSun.set(null);
  }

  saveTimesheet(targetStatus: string = 'Draft') {
    if (!this.tDate() || !this.tProject()) {
      this.showAlert('Error: Week Starting Date and Project Code are required.');
      return;
    }

    const selectedDate = new Date(this.tDate());
    if (selectedDate.getUTCDay() !== 1) {
      this.showAlert('Error: Please select a Monday as the starting date of the week.');
      return;
    }

    const weekHours = [
      { day: 0, h: this.tMon() }, { day: 1, h: this.tTue() }, { day: 2, h: this.tWed() },
      { day: 3, h: this.tThu() }, { day: 4, h: this.tFri() }, { day: 5, h: this.tSat() },
      { day: 6, h: this.tSun() }
    ];

    const entriesToSave = weekHours.filter(wh => wh.h !== null && wh.h > 0);
    if (entriesToSave.length === 0) {
      this.showAlert('Error: Please enter hours for at least one day.');
      return;
    }

    // --- DUPLICATE CHECK ---
    if (this.editingWeekIds().length === 0) {
      const existing = this.timesheets();
      const hasOverlap = entriesToSave.some(entry => {
        const dObj = new Date(selectedDate);
        dObj.setUTCDate(dObj.getUTCDate() + entry.day);
        const dStr = dObj.toISOString().split('T')[0];
        return existing.some(ext => ext.employee === this.loggedInFullName() && ext.projectCode === this.tProject() && ext.date === dStr);
      });

      if (hasOverlap) {
        this.showAlert('Error: This week already has logs for the selected project. Please Update the existing one.');
        return;
      }
    }

    const oldIds = this.editingWeekIds();
    const deleteObservables = oldIds.length > 0 
      ? oldIds.map(id => this.http.delete(`${this.apiUrl}/timesheet/${id}`).pipe(catchError(() => of(null))))
      : [of(null)];

    // Wait for all deletes to finish before posting
    forkJoin(deleteObservables).subscribe(() => {
      // Clear local state if we were editing
      if (oldIds.length > 0) {
        this.timesheets.update(list => list.filter(t => !oldIds.includes(t.id!)));
      }

      // Process fresh entries
      const postObservables = entriesToSave.map(entry => {
        const dateObj = new Date(selectedDate);
        dateObj.setUTCDate(dateObj.getUTCDate() + entry.day);
        const dateStr = dateObj.toISOString().split('T')[0];

        const newT: Timesheet = {
          date: dateStr,
          projectCode: this.tProject(),
          hours: entry.h!,
          status: targetStatus,
          description: this.tDesc(),
          employee: this.loggedInFullName()
        };
        return this.http.post<Timesheet>(`${this.apiUrl}/timesheet`, newT);
      });

      forkJoin(postObservables).subscribe({
        next: (savedResults) => {
          this.timesheets.update(list => [...savedResults, ...list]);
          this.showAlert(`Timesheet ${targetStatus === 'Draft' ? 'saved as draft' : 'submitted successfully'}.`, 'success');
          this.closeTimesheetModal();
        },
        error: (err) => {
          this.showAlert(err.error?.message || 'Error occurred during submission. Please check for duplicates.', 'error');
        }
      });
    });
  }

  submitTimesheet(ids?: number[]) {
    if(!ids || ids.length === 0) return;
    for (const id of ids) {
      this.http.put(`${this.apiUrl}/timesheet/${id}/submit`, {}).subscribe(() => {
        this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Submitted' } : t));
      });
    }
    this.showAlert('Selected week submitted for approval.', 'success');
  }
  
  deleteTimesheet(ids?: number[]) {
    if(!ids || ids.length === 0) return;
    for (const id of ids) {
      this.http.delete(`${this.apiUrl}/timesheet/${id}`).subscribe(() => {
        this.timesheets.update(list => list.filter(t => t.id !== id));
      });
    }
    this.showAlert('Draft week entries deleted.', 'success');
  }

  // --- Project Management (Manager) ---
  openNewProject() {
    this.editProjectId.set(null);
    this.pCode.set(''); this.pName.set(''); this.pClient.set(''); this.pBillable.set(true);
    this.pAssignee.set(''); this.pStartDate.set(''); this.pEndDate.set('');
    this.showProjectModal.set(true);
  }
  
  editProject(p: Project) {
    this.editProjectId.set(p.id!);
    this.pCode.set(p.code);
    this.pName.set(p.name);
    this.pClient.set(p.client);
    this.pBillable.set(p.isBillable);
    this.pAssignee.set(p.assignedEmployee || '');
    this.pStartDate.set(p.startDate || '');
    this.pEndDate.set(p.endDate || '');
    this.showProjectModal.set(true);
  }
  
  closeProjectModal() {
    this.showProjectModal.set(false);
    this.editProjectId.set(null);
    this.pCode.set(''); this.pName.set(''); this.pClient.set(''); this.pBillable.set(true);
    this.pAssignee.set(''); this.pStartDate.set(''); this.pEndDate.set('');
  }

  saveProject() {
    if (!this.pCode() || !this.pName() || !this.pClient() || !this.pAssignee() || !this.pStartDate() || !this.pEndDate()) {
      this.showAlert('Error: All fields including assignment dates are strictly required.'); return;
    }
    const editId = this.editProjectId();

    const payload: Project = {
      code: this.pCode(),
      name: this.pName(),
      client: this.pClient(),
      isBillable: this.pBillable(),
      status: 'Active',
      assignedEmployee: this.pAssignee(),
      startDate: this.pStartDate(),
      endDate: this.pEndDate()
    };
    
    if (editId) {
      this.http.put<Project>(`${this.apiUrl}/projects/${editId}`, payload).subscribe({
        next: (savedP) => {
          this.projects.update(list => list.map(p => p.id === editId ? savedP : p));
          this.closeProjectModal();
          this.showAlert('Project updated successfully.', 'success');
        },
        error: (err) => this.showAlert(err.error?.message || err.message || 'Error: Could not update project.')
      });
    } else {
      this.http.post<Project>(`${this.apiUrl}/projects`, payload).subscribe({
        next: (savedP) => {
          this.projects.update(list => [savedP, ...list]);
          this.closeProjectModal();
          this.showAlert('New project created and assigned.', 'success');
        },
        error: (err) => this.showAlert(err.error?.message || err.message || 'Error: Could not create project.')
      });
    }
  }

  toggleProjectStatus(id?: number) {
    if(!id) return;
    this.http.put(`${this.apiUrl}/projects/${id}/status`, {}).subscribe(() => {
      this.projects.update(list => list.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Deactivated' : 'Active' } : p));
      this.showAlert('Project status toggled.', 'success');
    });
  }

  // --- Approvals (Manager) ---
  approveTimesheet(ids?: number[]) {
    if(!ids || ids.length === 0) return;
    for (const id of ids) {
      this.http.put(`${this.apiUrl}/timesheet/${id}/approve`, {}).subscribe(() => {
        this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
      });
    }
    this.showAlert('Weekly timesheet approved.', 'success');
  }

  openRejectModal(ids?: number[]) {
    if(!ids || ids.length === 0) return;
    this.rejectActionIds.set(ids);
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.rejectActionIds.set([]);
    this.rejectComment.set('');
  }

  rejectTimesheet() {
    if (!this.rejectComment() || this.rejectComment().trim() === '') {
      this.showAlert('Error: Rejection requires mandatory comments.');
      return;
    }
    const ids = this.rejectActionIds();
    if (ids && ids.length > 0) {
      for (const id of ids) {
        this.http.put(`${this.apiUrl}/timesheet/${id}/reject`, { comment: this.rejectComment() }).subscribe({
          next: () => {
            this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Rejected', managerComment: this.rejectComment() } : t));
          }
        });
      }
      this.showAlert('Weekly timesheet rejected with comments.', 'success');
      this.closeRejectModal();
    }
  }
}