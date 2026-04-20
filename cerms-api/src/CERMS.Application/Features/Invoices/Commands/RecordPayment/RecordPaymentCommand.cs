using CERMS.Application.Common;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;

namespace CERMS.Application.Features.Invoices.Commands.RecordPayment;

public record RecordPaymentCommand(Guid InvoiceId, decimal Amount) : IRequest<Result>;

public class RecordPaymentCommandHandler : IRequestHandler<RecordPaymentCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public RecordPaymentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(request.InvoiceId);
        if (invoice == null) return Result.Failure("Invoice not found.");

        try
        {
            invoice.RecordPayment(request.Amount);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
