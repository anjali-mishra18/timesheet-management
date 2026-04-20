using Microsoft.EntityFrameworkCore;
using TimesheetApi.Models;

namespace TimesheetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<Timesheet> Timesheets { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Simplified for in-memory flat models
            modelBuilder.Entity<Project>().HasKey(p => p.Id);
            modelBuilder.Entity<Timesheet>().HasKey(t => t.Id);
            modelBuilder.Entity<User>().HasKey(u => u.Id);
        }
    }
}
