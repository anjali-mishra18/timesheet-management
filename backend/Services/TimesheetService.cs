using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimesheetApi.Models;
using TimesheetApi.Repositories;

using TimesheetApi.Factories;
using TimesheetApi.Strategies;

namespace TimesheetApi.Services
{
    public class TimesheetService : ITimesheetService
    {
        private readonly ITimesheetRepository _repository;
        private readonly IMapper _mapper;
        private readonly IValidationStrategy _validationStrategy;

        public TimesheetService(ITimesheetRepository repository, IMapper mapper, IValidationStrategy validationStrategy)
        {
            _repository = repository;
            _mapper = mapper;
            _validationStrategy = validationStrategy;
        }

        public async Task<IEnumerable<TimesheetDto>> GetAllAsync()
        {
            var timesheets = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TimesheetDto>>(timesheets);
        }

        public async Task<TimesheetDto?> CreateAsync(TimesheetDto timesheetDto)
        {
            // STRATEGY PATTERN HOOK
            if (!_validationStrategy.IsValid(timesheetDto)) {
                throw new System.Exception(_validationStrategy.GetErrorMessage());
            }

            var isDuplicate = await _repository.ExistsAsync(timesheetDto.Employee, timesheetDto.ProjectCode, timesheetDto.Date);
            if (isDuplicate) return null; // Signal duplicate failure back to Controller

            var timesheet = TimesheetFactory.CreateFromDto(timesheetDto);
            
            await _repository.AddAsync(timesheet);

            return _mapper.Map<TimesheetDto>(timesheet);
        }

        public async Task<TimesheetDto?> SubmitAsync(int id)
        {
            var t = await _repository.GetByIdAsync(id);
            if (t == null) return null;

            t.Status = "Submitted";
            await _repository.UpdateAsync(t);
            return _mapper.Map<TimesheetDto>(t);
        }

        public async Task<TimesheetDto?> ApproveAsync(int id)
        {
            var t = await _repository.GetByIdAsync(id);
            if (t == null) return null;

            t.Status = "Approved";
            await _repository.UpdateAsync(t);
            return _mapper.Map<TimesheetDto>(t);
        }

        public async Task<TimesheetDto?> RejectAsync(int id, string comment)
        {
            var t = await _repository.GetByIdAsync(id);
            if (t == null) return null;

            t.Status = "Rejected";
            t.ManagerComment = comment;
            await _repository.UpdateAsync(t);
            return _mapper.Map<TimesheetDto>(t);
        }

        public async Task<TimesheetDto?> DeleteAsync(int id)
        {
            var t = await _repository.GetByIdAsync(id);
            if (t == null) return null;

            await _repository.DeleteAsync(t);
            return _mapper.Map<TimesheetDto>(t);
        }
    }
}