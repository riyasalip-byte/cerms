namespace CERMS.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(byte[] content, string fileName, string contentType);
    Task<byte[]> GetFileAsync(string fileName);
    string GetFileUrl(string fileName);
}
