using StaffEntity = CERMS.Domain.Entities.Staff;
using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Staff.Queries;

public record GetStaffByIdQuery(Guid Id) : IRequest<Result<StaffDetailDto>>;

public class GetStaffByIdHandler : IRequestHandler<GetStaffByIdQuery, Result<StaffDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetStaffByIdHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<StaffDetailDto>> Handle(GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var staff = await _unitOfWork.Repository<StaffEntity>().Entities
            .Include(s => s.AllowedAssetClasses)
            .ThenInclude(sa => sa.AssetClass)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (staff is null)
            return Result<StaffDetailDto>.Failure("Staff not found.");

        return Result<StaffDetailDto>.Success(_mapper.Map<StaffDetailDto>(staff));
    }
}
