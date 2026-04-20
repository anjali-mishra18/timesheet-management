using System.Threading.Tasks;
using AutoMapper;
using Moq;
using NUnit.Framework;
using TimesheetApi.Models;
using TimesheetApi.Repositories;
using TimesheetApi.Services;
using TimesheetApi.Strategies;

namespace TimesheetApi.Tests
{
    [TestFixture]
    public class TimesheetServiceTests
    {
        private Mock<ITimesheetRepository> _mockRepo;
        private Mock<IMapper> _mockMapper;
        private Mock<IValidationStrategy> _mockValidation;
        private TimesheetService _service;

        [SetUp]
        public void Setup()
        {
            // Initialize Moq Fakes
            _mockRepo = new Mock<ITimesheetRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockValidation = new Mock<IValidationStrategy>();

            // Inject Moq Fakes dynamically into the real TimesheetService
            _service = new TimesheetService(_mockRepo.Object, _mockMapper.Object, _mockValidation.Object);
        }

        [Test]
        public async Task CreateAsync_WhenValidationFails_ThrowsException()
        {
            // Arrange
            var dto = new TimesheetDto { Hours = 35 }; // Invalid hours
            
            _mockValidation.Setup(v => v.IsValid(dto)).Returns(false);
            _mockValidation.Setup(v => v.GetErrorMessage()).Returns("Invalid Hours");

            // Act & Assert
            var ex = Assert.ThrowsAsync<System.Exception>(() => _service.CreateAsync(dto));
            Assert.That(ex.Message, Is.EqualTo("Invalid Hours"));

            // Verify the repository was never called saving corrupt data
            _mockRepo.Verify(r => r.AddAsync(It.IsAny<Timesheet>()), Times.Never());
        }

        [Test]
        public async Task CreateAsync_WhenDuplicateExists_ReturnsNull()
        {
            // Arrange
            var dto = new TimesheetDto { Employee = "Alice", ProjectCode = "PRJ-100", Date = "2026-04-17" };
            
            _mockValidation.Setup(v => v.IsValid(dto)).Returns(true);
            
            // Artificial condition where a duplicate natively triggers true
            _mockRepo.Setup(r => r.ExistsAsync(dto.Employee, dto.ProjectCode, dto.Date)).ReturnsAsync(true);

            // Act
            var result = await _service.CreateAsync(dto);

            // Assert
            Assert.That(result, Is.Null, "Service should seamlessly trap and return null if duplicate footprint is identified.");
            _mockRepo.Verify(r => r.AddAsync(It.IsAny<Timesheet>()), Times.Never());
        }

        [Test]
        public async Task ApproveAsync_WithValidId_ReturnsApprovedMappedDto()
        {
            // Arrange
            int targetId = 1;
            var fakeDbTimesheet = new Timesheet { Id = targetId, Status = "Draft" };
            var expectedDto = new TimesheetDto { Id = targetId, Status = "Approved" };

            // When GetById is called, return our fake timesheet!
            _mockRepo.Setup(r => r.GetByIdAsync(targetId)).ReturnsAsync(fakeDbTimesheet);
            _mockMapper.Setup(m => m.Map<TimesheetDto>(fakeDbTimesheet)).Returns(expectedDto);

            // Act
            var result = await _service.ApproveAsync(targetId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result?.Status, Is.EqualTo("Approved"));
            
            // Mathematically prove the object state changed before saving to SQL
            Assert.That(fakeDbTimesheet.Status, Is.EqualTo("Approved"));
            _mockRepo.Verify(r => r.UpdateAsync(fakeDbTimesheet), Times.Once());
        }
    }
}
