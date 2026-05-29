using StaffEntity = CERMS.Domain.Entities.Staff;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetRolesQuery : IRequest<Result<List<RoleDto>>>;

public class GetRolesHandler : IRequestHandler<GetRolesQuery, Result<List<RoleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRolesHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<List<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var items = await _unitOfWork.Repository<Role>().Entities
            .OrderBy(r => r.Name)
            .ProjectTo<RoleDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<List<RoleDto>>.Success(items);
    }
}
