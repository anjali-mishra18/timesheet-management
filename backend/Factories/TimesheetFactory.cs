using TimesheetApi.Models;

namespace TimesheetApi.Factories
{
    // FACTORY PATTERN: Centralizes the complex initialization of objects.
    public static class TimesheetFactory
    {
        public static Timesheet CreateNewDraft(TimesheetDto dto)
        {
            return new Timesheet
            {
                Date = dto.Date,
                ProjectCode = dto.ProjectCode,
                Hours = dto.Hours,
                Description = dto.Description,
                Employee = dto.Employee,
                Status = "Draft",
                ManagerComment = null
            };
        }

        public static Timesheet CreateFromDto(TimesheetDto dto)
        {
            return new Timesheet
            {
                Date = dto.Date,
                ProjectCode = dto.ProjectCode,
                Hours = dto.Hours,
                Description = dto.Description,
                Employee = dto.Employee,
                Status = dto.Status, // HONOR THE DTO STATUS
                ManagerComment = null
            };
        }
    }
}