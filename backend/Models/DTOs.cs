using System;

namespace TimesheetApi.Models
{
    // These DTOs (Data Transfer Objects) are what the API exposes externally,
    // hiding the internal Entity database structure for security.
    
    public class TimesheetDto
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty;
        public string ProjectCode { get; set; } = string.Empty;
        public decimal Hours { get; set; }
        public string Status { get; set; } = "Draft";
        public string Description { get; set; } = string.Empty;
        public string Employee { get; set; } = string.Empty;
        public string? ManagerComment { get; set; }
    }

    public class ProjectDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public bool IsBillable { get; set; }
        public string Status { get; set; } = "Active";
        public string AssignedEmployee { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
    }

    public class RejectDto
    {
        public string Comment { get; set; } = string.Empty;
    }
}
