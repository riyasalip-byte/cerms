using CERMS.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CERMS.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LocalFileStorageService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        // In a real app, this would be in configuration
        _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "invoices");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> SaveFileAsync(byte[] content, string fileName, string contentType)
    {
        var filePath = Path.Combine(_storagePath, fileName);
        await File.WriteAllBytesAsync(filePath, content);
        
        return fileName; // Return the filename as the relative URL part
    }

    public async Task<byte[]> GetFileAsync(string fileName)
    {
        var filePath = Path.Combine(_storagePath, fileName);
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Invoice PDF not found.", fileName);
        }
        
        return await File.ReadAllBytesAsync(filePath);
    }

    public string GetFileUrl(string fileName)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null) return fileName;
        
        var baseUrl = $"{request.Scheme}://{request.Host}";
        return $"{baseUrl}/invoices/{fileName}";
    }
}
