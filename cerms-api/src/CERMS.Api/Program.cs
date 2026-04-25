using CERMS.Api.Middleware;
using CERMS.Api.Extensions;
using CERMS.Infrastructure.Persistence;
using CERMS.Application;
using CERMS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHangfireConfig(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CERMS",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CERMS_Users",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "a_very_long_and_secure_secret_key_1234567890_extended_for_security_reasons")),
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

// Initialise and Seed Database
using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider.GetRequiredService<CermsDbContextInitialiser>();
    await initialiser.InitialiseAsync();
    await initialiser.SeedAsync();
}

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");


app.UseAuthentication();
app.UseAuthorization();
app.UseHangfire();

// Schedule Recurring Jobs
using (var scope = app.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
    recurringJobManager.AddOrUpdate<CERMS.Infrastructure.Jobs.PayrollJob>(
        "monthly-payroll",
        job => job.ProcessMonthlyPayroll(DateTime.UtcNow),
        Cron.Monthly(1) // Run on the 1st of every month
    );

    recurringJobManager.AddOrUpdate<CERMS.Infrastructure.Jobs.InvoiceReminderJob>(
        "invoice-reminders",
        job => job.SendOverdueReminders(),
        Cron.Daily() // Run every day
    );

    recurringJobManager.AddOrUpdate<CERMS.Infrastructure.Jobs.LicenceExpiryAlertJob>(
        "licence-expiry-alerts",
        job => job.CheckLicenceExpiries(),
        Cron.Daily() // Run every day
    );
}

app.MapControllers();

app.Run();
