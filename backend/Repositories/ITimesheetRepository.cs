using System.Collections.Generic;
using System.Threading.Tasks;
using TimesheetApi.Models;

namespace TimesheetApi.Repositories
{
    public interface ITimesheetRepository
    {
        Task<IEnumerable<Timesheet>> GetAllAsync();
        Task<Timesheet?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(string employee, string projectCode, string date);
        Task AddAsync(Timesheet timesheet);
        Task UpdateAsync(Timesheet timesheet);
        Task DeleteAsync(Timesheet timesheet);
    }
}
