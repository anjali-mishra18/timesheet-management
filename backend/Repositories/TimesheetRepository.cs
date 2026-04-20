using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TimesheetApi.Data;
using TimesheetApi.Models;

namespace TimesheetApi.Repositories
{
    public class TimesheetRepository : ITimesheetRepository
    {
        private readonly AppDbContext _context;

        public TimesheetRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Timesheet>> GetAllAsync()
        {
            return await _context.Timesheets.OrderByDescending(t => t.Date).ToListAsync();
        }

        public async Task<Timesheet?> GetByIdAsync(int id)
        {
            return await _context.Timesheets.FindAsync(id);
        }

        public async Task<bool> ExistsAsync(string employee, string projectCode, string date)
        {
            return await _context.Timesheets.AnyAsync(t => 
                t.Employee == employee && 
                t.ProjectCode == projectCode && 
                t.Date == date);
        }

        public async Task AddAsync(Timesheet timesheet)
        {
            _context.Timesheets.Add(timesheet);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Timesheet timesheet)
        {
            // Attach and save state logic strictly inside repository payload
            _context.Timesheets.Update(timesheet);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Timesheet timesheet)
        {
            _context.Timesheets.Remove(timesheet);
            await _context.SaveChangesAsync();
        }
    }
}
