using Microsoft.EntityFrameworkCore;
using TimesheetApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Use In-Memory Database for maximum portability (Wipes data on restart)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("TimesheetDb"));

// Register AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// STRATEGY PATTERN INJECTION
builder.Services.AddScoped<TimesheetApi.Strategies.IValidationStrategy, TimesheetApi.Strategies.StandardValidationStrategy>();

// Register Repositories and Services for Dependency Injection
builder.Services.AddScoped<TimesheetApi.Repositories.ITimesheetRepository, TimesheetApi.Repositories.TimesheetRepository>();

// DECORATOR PATTERN INJECTION: We register the exact concrete Service first
builder.Services.AddScoped<TimesheetApi.Services.TimesheetService>();

// Then we magically assign the Interface to the Decorator, wrapping the concrete Service inside!
builder.Services.AddScoped<TimesheetApi.Services.ITimesheetService>(provider => 
    new TimesheetApi.Decorators.LoggingTimesheetServiceDecorator(
        provider.GetRequiredService<TimesheetApi.Services.TimesheetService>()
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Seed Database before running the application handling logic
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Automatically creates the physical timesheet.db file and tables
    context.Database.EnsureCreated();

    if (!context.Users.Any())
    {
        context.Users.AddRange(
            new TimesheetApi.Models.User { Id = 1, Username = "manager_alice", Password = "password123", Role = "Manager", FullName = "Alice Smith" },
            new TimesheetApi.Models.User { Id = 2, Username = "manager_bob", Password = "password123", Role = "Manager", FullName = "Bob Jones" },
            new TimesheetApi.Models.User { Id = 3, Username = "emp_charlie", Password = "password123", Role = "Employee", FullName = "Charlie Brown" },
            new TimesheetApi.Models.User { Id = 4, Username = "emp_diana", Password = "password123", Role = "Employee", FullName = "Diana Prince" }
        );
    }

    if (!context.Projects.Any())
    {
        context.Projects.AddRange(
            new TimesheetApi.Models.Project { Id = 101, Code = "PRJ-BMW", Name = "BMW Motor Optimization", Client = "BMW Group", IsBillable = true, Status = "Active", AssignedEmployee = "Charlie Brown", StartDate = "2026-04-01", EndDate = "2026-05-30" },
            new TimesheetApi.Models.Project { Id = 102, Code = "PRJ-TSLA", Name = "Tesla AI Visuals", Client = "Tesla Inc", IsBillable = true, Status = "Active", AssignedEmployee = "Diana Prince", StartDate = "2026-04-15", EndDate = "2026-06-15" }
        );
    }

    context.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
