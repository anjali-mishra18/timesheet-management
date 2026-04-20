-- SQL Seed Data Script for Timesheet Management System

-- Seed Users (Employees and Managers)
INSERT INTO Users (Id, Username, Role, FullName, Email, IsActive) VALUES
(1, 'manager_alice', 'Manager', 'Alice Smith', 'alice.manager@company.com', 1),
(2, 'manager_bob', 'Manager', 'Bob Jones', 'bob.manager@company.com', 1),
(3, 'emp_charlie', 'Employee', 'Charlie Brown', 'charlie.emp@company.com', 1),
(4, 'emp_diana', 'Employee', 'Diana Prince', 'diana.emp@company.com', 1);

-- Seed Projects
INSERT INTO Projects (Id, ProjectCode, ProjectName, ClientName, IsBillable, Status, ManagerId) VALUES
(1, 'PRJ-100', 'Alpha Overhaul', 'Acme Corp', 1, 'Active', 1),
(2, 'PRJ-101', 'Beta Migration', 'TechGlobal', 1, 'Active', 1),
(3, 'PRJ-102', 'Internal Tooling', 'Internal', 0, 'Active', 2);

-- Seed User-Project Assignments
-- Employee Charlie assigned to PRJ-100 and PRJ-102
INSERT INTO ProjectAssignments (Id, UserId, ProjectId, StartDate, EndDate, IsActive) VALUES
(1, 3, 1, '2026-01-01', '2026-12-31', 1),
(2, 3, 3, '2026-03-01', '2026-08-31', 1),
-- Employee Diana assigned to PRJ-101
(3, 4, 2, '2026-02-15', '2026-11-30', 1);

-- Seed Initial Timesheets (Draft, Submitted, Approved)
INSERT INTO Timesheets (Id, UserId, WeekStartDate, Status, ManagerComment) VALUES
(1, 3, '2026-04-12', 'Approved', 'Great work.'),
(2, 4, '2026-04-12', 'Submitted', NULL);

-- Seed Timesheet Entries for Charlie (Approved)
INSERT INTO TimesheetEntries (Id, TimesheetId, ProjectId, Date, HoursWorked, Description) VALUES
(1, 1, 1, '2026-04-13', 8, 'Backend development for Alpha.'),
(2, 1, 1, '2026-04-14', 8, 'Bug fixing Alpha APIs.'),
(3, 1, 3, '2026-04-15', 4, 'Internal documentation.'),
(4, 1, 3, '2026-04-16', 4, 'CI/CD pipeline tweaks.');

-- Seed Timesheet Entries for Diana (Submitted)
INSERT INTO TimesheetEntries (Id, TimesheetId, ProjectId, Date, HoursWorked, Description) VALUES
(5, 2, 2, '2026-04-13', 8, 'Beta frontend setup.'),
(6, 2, 2, '2026-04-14', 8, 'User dashboard UI.');
