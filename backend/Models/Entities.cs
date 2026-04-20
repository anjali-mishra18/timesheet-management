using System;
using System.Collections.Generic;

namespace TimesheetApi.Models
{
    public class Timesheet
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public string ProjectCode { get; set; } = string.Empty;
        public decimal Hours { get; set; }
        public string Status { get; set; } = "Draft"; // "Draft", "Submitted", "Approved", "Rejected"
        public string Description { get; set; } = string.Empty;
        public string Employee { get; set; } = string.Empty;
        public string? ManagerComment { get; set; }
    }

    public class Project
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public bool IsBillable { get; set; }
        public string Status { get; set; } = "Active"; // "Active", "Deactivated"
        
        // Assignment Meta
        public string AssignedEmployee { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
    }

    // Database Authentication Entity
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // using plain text just for the mock assignment
        public string Role { get; set; } = string.Empty; // "Employee" or "Manager"
        public string FullName { get; set; } = string.Empty;
    }
}
