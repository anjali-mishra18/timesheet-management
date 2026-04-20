using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimesheetApi.Models;
using TimesheetApi.Services;

namespace TimesheetApi.Decorators
{
    // DECORATOR PATTERN: Attaches additional responsibilities to an object dynamically
    // without altering its internal structure by wrapping it.
    public class LoggingTimesheetServiceDecorator : ITimesheetService
    {
        private readonly ITimesheetService _inner;

        // Injects the REAL implementation to wrap around
        public LoggingTimesheetServiceDecorator(ITimesheetService inner)
        {
            _inner = inner;
        }

        public async Task<IEnumerable<TimesheetDto>> GetAllAsync()
        {
            Console.WriteLine("[LOG]: Intercepted GetAllAsync Call using Decorator.");
            return await _inner.GetAllAsync();
        }

        public async Task<TimesheetDto?> CreateAsync(TimesheetDto timesheetDto)
        {
            Console.WriteLine($"[LOG]: Intercepted CreateAsync Call for employee {timesheetDto.Employee}.");
            return await _inner.CreateAsync(timesheetDto);
        }

        public async Task<TimesheetDto?> SubmitAsync(int id)
        {
            Console.WriteLine($"[LOG]: Intercepted Submit Call for Timesheet ID {id}.");
            return await _inner.SubmitAsync(id);
        }

        public async Task<TimesheetDto?> ApproveAsync(int id)
        {
            Console.WriteLine($"[LOG]: Intercepted Approve Call for Timesheet ID {id}.");
            return await _inner.ApproveAsync(id);
        }

        public async Task<TimesheetDto?> RejectAsync(int id, string comment)
        {
            Console.WriteLine($"[LOG]: Intercepted Reject Call for Timesheet ID {id} with comment: {comment}.");
            return await _inner.RejectAsync(id, comment);
        }

        public async Task<TimesheetDto?> DeleteAsync(int id)
        {
            Console.WriteLine($"[LOG]: Intercepted Delete Call for Timesheet ID {id}.");
            return await _inner.DeleteAsync(id);
        }
    }
}
