using CERMS.Api.Middleware;
using CERMS.Api.Extensions;
using CERMS.Infrastructure.Persistence;
using CERMS.Application;
using CERMS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using System.Text;
using Hangfire;
using System;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHangfireConfig(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
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

if (!builder.Environment.IsDevelopment())
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

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
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    // Optional: To serve the Swagger UI at the app's root (https://cerms-api.onrender.com), uncomment the next line:
    // c.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.UseHangfire();

// Schedule Recurring Jobs
try
{
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
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(ex, "Failed to schedule recurring Hangfire jobs. The application will continue to boot.");
}

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CermsDbContext>();
    db.Database.Migrate();
}

app.Run();
