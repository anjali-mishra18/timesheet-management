using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimesheetApi.Data;
using TimesheetApi.Models;

namespace TimesheetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProjectsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _context.Projects.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<ProjectDto>>(projects);
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProjectDto projectDto)
        {
            var project = _mapper.Map<Project>(projectDto);
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            
            var returnDto = _mapper.Map<ProjectDto>(project);
            return Ok(returnDto);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var p = await _context.Projects.FindAsync(id);
            if (p == null) return NotFound();

            p.Status = p.Status == "Active" ? "Deactivated" : "Active";
            await _context.SaveChangesAsync();
            
            var returnDto = _mapper.Map<ProjectDto>(p);
            return Ok(returnDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, ProjectDto updatedProjectDto)
        {
            var p = await _context.Projects.FindAsync(id);
            if (p == null) return NotFound();

            // Using AutoMapper to update properties
            _mapper.Map(updatedProjectDto, p);
            
            await _context.SaveChangesAsync();
            
            var returnDto = _mapper.Map<ProjectDto>(p);
            return Ok(returnDto);
        }
    }
}
