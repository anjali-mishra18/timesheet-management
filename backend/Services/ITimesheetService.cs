using System.Collections.Generic;
using System.Threading.Tasks;
using TimesheetApi.Models;

namespace TimesheetApi.Services
{
    public interface ITimesheetService
    {
        Task<IEnumerable<TimesheetDto>> GetAllAsync();
        Task<TimesheetDto?> CreateAsync(TimesheetDto timesheetDto);
        Task<TimesheetDto?> SubmitAsync(int id);
        Task<TimesheetDto?> ApproveAsync(int id);
        Task<TimesheetDto?> RejectAsync(int id, string comment);
        Task<TimesheetDto?> DeleteAsync(int id);
    }
}
