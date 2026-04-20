using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimesheetApi.Data;
using TimesheetApi.Models;

namespace TimesheetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Incorrect details" });
            }

            if (user.Role != request.LoginRole)
            {
                return Unauthorized(new { message = "Incorrect details" });
            }

            return Ok(new { 
                token = "mock-jwt-token-12345", 
                username = user.Username, 
                fullName = user.FullName,
                role = user.Role 
            });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string LoginRole { get; set; } = string.Empty;
    }
}
