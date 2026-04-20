using CERMS.Domain.Common;

namespace CERMS.Application.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    IQueryable<T> Entities { get; }
    Task<T?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}
