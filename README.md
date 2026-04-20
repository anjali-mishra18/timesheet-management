# Timesheet Management System

This repository contains a full-stack Timesheet Management System built using .NET 8 (Backend API) and Angular (Frontend).

## Architecture Details

The system is separated into two decoupled applications communicating over REST.

### Backend (.NET 8)
- **Framework**: ASP.NET Core Web API using .NET 8.
- **ORM**: Entity Framework Core with Code-First Migration.
- **Database**: SQL Server (or LocalDB).
- **Architecture**: N-Tier Architecture (API, Business Logic/Services, Data Access/Repositories).
- **Design Patterns Implemented**:
  - **Repository Pattern**: Centralizes data access, providing a clear abstraction over EF Core.
  - **Factory Pattern**: Used for creating complex objects (e.g., Report generation factories).
  - **Strategy Pattern**: Applied to handle varying Timesheet Approval workflows depending on project requirements or roles.
  - **Decorator Pattern**: Used to attach caching and logging behaviors to services without modifying fundamental logic.
  - **Dependency Injection**: Integrated heavily using .NET's built-in IoC container for loose coupling.
- **Data Mapping**: AutoMapper is utilized for seamless translations between database Entities and Data Transfer Objects (DTOs).

### Frontend (Angular)
- **Framework**: Angular 18+
- **Global State Management**: NgRx. Contains reducers, actions, effects, and selectors to handle the application state globally (e.g. current user context).
- **Local State & Reactivity**: Angular Signals for local component states and RxJS for handling asynchronous operations.
- **Form Management**: Reactive Forms for complex validation scenarios, like ensuring timesheets do not exceed 24 hours per day.
- **Styling**: Pure CSS combined with dynamic transitions for a clean, modern, and attractive User Interface.

## Trade-offs
- **REST vs GraphQL**: A REST API was chosen over GraphQL to minimize complexity, as the data retrieval needs were straightforward and well-defined.
- **Code-First EF Core**: Selected over Database-First to keep the source of truth within version control and improve development velocity.
- **NgRx vs lightweight signals**: Used NgRx for core global state (auth, project catalog) alongside Signals for local states to balance scalability and performance.

## Running the Application

### Backend (.NET)
1. Navigate to the `backend` folder.
2. Run `dotnet restore`
3. Optional: apply migrations if a real DB connection string is set up `dotnet ef database update`.
4. Run `dotnet run`

### Frontend (Angular)
1. Navigate to the `frontend` folder.
2. Run `npm install`
3. Run `npm run start` or `ng serve`
4. Access the web application at `http://localhost:4200`

### Mock/Test Data
A SQL Seed Data Script (`seed_data.sql`) is provided to populate the DB with Managers, Employees, Projects, and sample Timesheets.
