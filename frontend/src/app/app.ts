import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Timesheet } from './features/timesheets/timesheet.model';
import { Project } from './features/projects/project.model';

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

  // Form States - Timesheet
  tProject = signal('PRJ-100');
  tDate = signal('');
  tHours = signal<number | null>(null);
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
  rejectActionId = signal<number | null>(null);

  activeProjects = computed(() => this.projects().filter(p => p.status === 'Active'));
  
  // Computeds - Reports Filters
  filterStartDate = signal('');
  filterEndDate = signal('');
  
  // Computeds - Employee
  myAssignedProjects = computed(() => this.activeProjects().filter(p => p.assignedEmployee === this.loggedInFullName()));
  employeeTimesheets = computed(() => this.timesheets().filter(t => t.employee === this.loggedInFullName()));
  totalEmployeeHours = computed(() => this.employeeTimesheets().reduce((sum, t) => sum + t.hours, 0));

  // Computeds - Manager
  pendingTimesheets = computed(() => this.timesheets().filter(t => t.status === 'Submitted'));
  
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
  showAlert(msg: string) {
    this.customAlertMessage.set(msg);
    setTimeout(() => this.customAlertMessage.set(''), 3500);
  }

  // --- Timesheet Creation (Employee) ---
  openNewTimesheet() {
    this.showTimesheetModal.set(true);
  }

  closeTimesheetModal() {
    this.showTimesheetModal.set(false);
    this.tDate.set(''); this.tHours.set(null); this.tDesc.set('');
  }

  saveTimesheet() {
    const hours = this.tHours();
    if (!hours || hours <= 0 || hours > 24) {
      this.showAlert('Error: You can only log between 1 and 24 hours per day.');
      return;
    }
    if (!this.tDate() || !this.tProject()) {
      this.showAlert('Error: Date and Project Code are required.');
      return;
    }
    const dup = this.employeeTimesheets().find(t => t.projectCode === this.tProject() && t.date === this.tDate());
    if (dup) {
      this.showAlert('Error: No duplicate entries allowed for same project code and date.');
      return;
    }

    const newT: Timesheet = {
      date: this.tDate(),
      projectCode: this.tProject(),
      hours: hours,
      status: 'Draft',
      description: this.tDesc(),
      employee: this.loggedInFullName()
    };
    
    this.http.post<Timesheet>(`${this.apiUrl}/timesheet`, newT).subscribe({
      next: (savedT) => {
        this.timesheets.update(list => [savedT, ...list]);
        this.closeTimesheetModal();
      },
      error: (err) => {
        this.showAlert(err.error || 'Database Error: Entry blocked by server validation rule.');
      }
    });
  }

  submitTimesheet(id?: number) {
    if(!id) return;
    this.http.put(`${this.apiUrl}/timesheet/${id}/submit`, {}).subscribe(() => {
      this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Submitted' } : t));
    });
  }
  
  deleteTimesheet(id?: number) {
    if(!id) return;
    this.http.delete(`${this.apiUrl}/timesheet/${id}`).subscribe(() => {
      this.timesheets.update(list => list.filter(t => t.id !== id));
    });
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
        },
        error: (err) => this.showAlert(err.error?.message || err.message || 'Error: Could not update project.')
      });
    } else {
      this.http.post<Project>(`${this.apiUrl}/projects`, payload).subscribe({
        next: (savedP) => {
          this.projects.update(list => [savedP, ...list]);
          this.closeProjectModal();
        },
        error: (err) => this.showAlert(err.error?.message || err.message || 'Error: Could not create project.')
      });
    }
  }

  toggleProjectStatus(id?: number) {
    if(!id) return;
    this.http.put(`${this.apiUrl}/projects/${id}/status`, {}).subscribe(() => {
      this.projects.update(list => list.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Deactivated' : 'Active' } : p));
    });
  }

  // --- Approvals (Manager) ---
  approveTimesheet(id?: number) {
    if(!id) return;
    this.http.put(`${this.apiUrl}/timesheet/${id}/approve`, {}).subscribe(() => {
      this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
    });
  }

  openRejectModal(id?: number) {
    if(!id) return;
    this.rejectActionId.set(id);
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.rejectActionId.set(null);
    this.rejectComment.set('');
  }

  rejectTimesheet() {
    if (!this.rejectComment() || this.rejectComment().trim() === '') {
      this.showAlert('Error: Rejection requires mandatory comments.');
      return;
    }
    const id = this.rejectActionId();
    if (id) {
      this.http.put(`${this.apiUrl}/timesheet/${id}/reject`, { comment: this.rejectComment() }).subscribe(() => {
        this.timesheets.update(list => list.map(t => t.id === id ? { ...t, status: 'Rejected', managerComment: this.rejectComment() } : t));
        this.closeRejectModal();
      });
    }
  }
}
