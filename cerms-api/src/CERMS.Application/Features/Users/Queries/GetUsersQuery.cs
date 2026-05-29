using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Queries;

public record GetUsersQuery : IRequest<Result<PagedResult<UserDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? RoleName { get; init; }
    public string? SearchTerm { get; init; }
}

public class GetUsersHandler : IRequestHandler<GetUsersQuery, Result<PagedResult<UserDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetUsersHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<User>().Entities
            .Include(u => u.Role)
            .Include(u => u.Staff)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.RoleName))
            query = query.Where(u => u.Role.Name == request.RoleName);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                u.Staff.DisplayName.ToLower().Contains(term));
        }

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(u => u.Username)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<UserDto>>.Success(
            new PagedResult<UserDto>(items, count, request.PageNumber, request.PageSize));
    }
}
