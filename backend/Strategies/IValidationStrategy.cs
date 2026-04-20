using TimesheetApi.Models;

namespace TimesheetApi.Strategies
{
    // STRATEGY PATTERN: Defines a family of algorithms, encapsulates each one, 
    // and makes them interchangeable at runtime.
    public interface IValidationStrategy
    {
        bool IsValid(TimesheetDto dto);
        string GetErrorMessage();
    }

    public class StandardValidationStrategy : IValidationStrategy
    {
        public bool IsValid(TimesheetDto dto)
        {
            // Standard strategy: Hours must be between 0.5 and 24
            return dto.Hours > 0 && dto.Hours <= 24;
        }

        public string GetErrorMessage() => "Hours must be greater than 0 and less than or equal to 24.";
    }

    public class StrictValidationStrategy : IValidationStrategy
    {
        public bool IsValid(TimesheetDto dto)
        {
            // Strict strategy: Shifts cannot easily exceed 12 hours cleanly without overtime
            return dto.Hours > 0 && dto.Hours <= 12;
        }

        public string GetErrorMessage() => "Strict policy prohibits shifts exceeding 12 continuous hours.";
    }
}
