using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using CERMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CERMS.Application.Features.Assignments.Queries;

public record GetOperatorAssignmentsQuery : IRequest<Result<List<OperatorAssignmentDto>>>;

public class GetOperatorAssignmentsHandler : IRequestHandler<GetOperatorAssignmentsQuery, Result<List<OperatorAssignmentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;

    public GetOperatorAssignmentsHandler(IUnitOfWork unitOfWork, ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    public async Task<Result<List<OperatorAssignmentDto>>> Handle(GetOperatorAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentTenantService.UserId;
        if (currentUserId == null)
            return Result<List<OperatorAssignmentDto>>.Failure("User is not authenticated.");

        var op = await _unitOfWork.Repository<Operator>().Entities
            .FirstOrDefaultAsync(o => o.UserId == currentUserId, cancellationToken);

        if (op == null)
            return Result<List<OperatorAssignmentDto>>.Failure("Operator profile not found.");

        var assignments = await (from ra in _unitOfWork.Repository<RentalAssignment>().Entities
                                 join rb in _unitOfWork.Repository<RentalBooking>().Entities on ra.RentalId equals rb.Id
                                 join a in _unitOfWork.Repository<Asset>().Entities on rb.AssetId equals a.Id
                                 join c in _unitOfWork.Repository<Customer>().Entities on rb.CustomerId equals c.Id
                                 join inv in _unitOfWork.Repository<Invoice>().Entities on rb.Id equals inv.BookingId into invGroup
                                 from inv in invGroup.DefaultIfEmpty()
                                 where ra.OperatorId == op.Id
                                 select new OperatorAssignmentDto
                                 {
                                     Id = ra.Id,
                                     RentalId = ra.RentalId,
                                     CustomerName = c.CustomerName,
                                     AssetName = a.AssetName,
                                     AssetCode = a.AssetCode,
                                     SiteName = rb.SiteName,
                                     SiteAddress = rb.SiteAddress,
                                     StartDateTime = rb.StartDateTime,
                                     ExpectedEndDateTime = rb.ExpectedEndDateTime,
                                     ActualEndDateTime = rb.ActualEndDateTime,
                                     RateType = rb.RateType,
                                     RateAmount = rb.RateAmount,
                                     AssignmentStatus = ra.AssignmentStatus,
                                     AssignedAt = ra.AssignedAt,
                                     ActualStartDateTime = ra.ActualStartDateTime,
                                     StartMeterReading = ra.StartMeterReading,
                                     EndMeterReading = ra.EndMeterReading,
                                     StartRemarks = ra.StartRemarks,
                                     CompletionRemarks = ra.CompletionRemarks,
                                     IsInvoiceGenerated = ra.IsInvoiceGenerated,
                                     InvoiceGeneratedAt = ra.InvoiceGeneratedAt,
                                     PickupTransportCharge = rb.PickupTransportCharge,
                                     ReturnTransportCharge = rb.ReturnTransportCharge,
                                     OperatorId = ra.OperatorId,
                                     OperatorName = ra.Operator.FullName,
                                     OperatorCode = ra.Operator.OperatorCode,
                                     OperatorMobile = ra.Operator.MobileNo,
                                     InvoiceId = (Guid?)inv.Id
                                 })
                                 .OrderByDescending(x => x.AssignedAt)
                                 .ToListAsync(cancellationToken);

        return Result<List<OperatorAssignmentDto>>.Success(assignments);
    }
}
