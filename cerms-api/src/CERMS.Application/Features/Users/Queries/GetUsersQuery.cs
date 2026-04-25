using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Queries;

public record GetUsersQuery : IRequest<Result<PaginatedList<UserDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public UserRole? Role { get; init; }
}

public class GetUsersHandler : IRequestHandler<GetUsersQuery, Result<PaginatedList<UserDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetUsersHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<User>().Entities;

        if (request.Role.HasValue)
        {
            query = query.Where(x => x.Role == request.Role);
        }

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(u => u.Username)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<UserDto>(items, count, request.PageNumber, request.PageSize);
        return Result<PaginatedList<UserDto>>.Success(paginatedList);
    }
}
