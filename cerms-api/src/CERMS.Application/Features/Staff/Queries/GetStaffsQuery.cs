using StaffEntity = CERMS.Domain.Entities.Staff;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetStaffsQuery : IRequest<Result<PagedResult<StaffDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
    public EmployeeCategory? EmployeeCategory { get; init; }
    public EmploymentStatus? EmploymentStatus { get; init; }
}

public class GetStaffsHandler : IRequestHandler<GetStaffsQuery, Result<PagedResult<StaffDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetStaffsHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<StaffDto>>> Handle(GetStaffsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Repository<StaffEntity>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(s =>
                s.StaffCode.ToLower().Contains(term) ||
                s.DisplayName.ToLower().Contains(term) ||
                s.MobileNo.ToLower().Contains(term) ||
                s.FirstName.ToLower().Contains(term) ||
                s.LastName.ToLower().Contains(term));
        }

        if (request.EmployeeCategory.HasValue)
            query = query.Where(s => s.EmployeeCategory == request.EmployeeCategory.Value);

        if (request.EmploymentStatus.HasValue)
            query = query.Where(s => s.EmploymentStatus == request.EmploymentStatus.Value);

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<StaffDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<PagedResult<StaffDto>>.Success(
            new PagedResult<StaffDto>(items, count, request.PageNumber, request.PageSize));
    }
}
