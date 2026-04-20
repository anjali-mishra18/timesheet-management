using AutoMapper;
using TimesheetApi.Models;

namespace TimesheetApi.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Maps the Database Entity to the DTO
            CreateMap<Project, ProjectDto>().ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            
            CreateMap<Timesheet, TimesheetDto>().ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
        }
    }
}
