using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimesheetApi.Models;
using TimesheetApi.Services;

namespace TimesheetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimesheetController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;

        public TimesheetController(ITimesheetService timesheetService)
        {
            _timesheetService = timesheetService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var dtos = await _timesheetService.GetAllAsync();
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TimesheetDto timesheetDto)
        {
            var result = await _timesheetService.CreateAsync(timesheetDto);
            
            if (result == null)
            {
                return BadRequest(new { message = "Error: No duplicate entries allowed for same project code and date." });
            }

            return Ok(result);
        }

        [HttpPut("{id}/submit")]
        public async Task<IActionResult> Submit(int id)
        {
            var result = await _timesheetService.SubmitAsync(id);
            if (result == null) return NotFound();
            
            return Ok(result);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _timesheetService.ApproveAsync(id);
            if (result == null) return NotFound();
            
            return Ok(result);
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectDto request)
        {
            var result = await _timesheetService.RejectAsync(id, request.Comment);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _timesheetService.DeleteAsync(id);
            if (result == null) return NotFound();

            return Ok(result);
        }
    }
}
