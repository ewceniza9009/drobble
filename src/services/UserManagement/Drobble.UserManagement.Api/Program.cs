using Drobble.UserManagement.Application.Contracts;
using Drobble.UserManagement.Application.Features.Users.Commands;
using Drobble.UserManagement.Application.Features.Users.Queries; 
using Drobble.UserManagement.Infrastructure.Persistence;
using Drobble.UserManagement.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// Register our services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>(); // Singleton is fine for a stateless service
builder.Services.AddSingleton<IPasswordVerifier, BCryptPasswordVerifier>();
builder.Services.AddSingleton<IJwtGenerator, JwtGenerator>();

// Register MediatR
builder.Services.AddMediatR(cfg =>
{
    // Scan both Commands and Queries folders
    cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(LoginUserQuery).Assembly);
});

// Add required EF Core Design package for migrations
builder.Services.AddDbContext<UserDbContext>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();