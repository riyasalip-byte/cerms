using CERMS.Domain.Common;
using CERMS.Domain.Enums;
using System;

namespace CERMS.Domain.Entities;

public class RentalAssignment : BaseEntity
{
    public Guid RentalId { get; private set; }
    public RentalBooking RentalBooking { get; private set; }

    public Guid OperatorId { get; private set; }
    public Operator Operator { get; private set; }

    public DateTime AssignedAt { get; private set; }
    public Guid? AssignedBy { get; private set; }
    public AssignmentStatus AssignmentStatus { get; private set; }

    public DateTime? ActualStartDateTime { get; private set; }
    public DateTime? ActualEndDateTime { get; private set; }

    public decimal? StartMeterReading { get; private set; }
    public decimal? EndMeterReading { get; private set; }

    public string? StartRemarks { get; private set; }
    public string? CompletionRemarks { get; private set; }

    public bool IsInvoiceGenerated { get; private set; }
    public DateTime? InvoiceGeneratedAt { get; private set; }
    public DateTime? LastSyncedAt { get; private set; }

    protected RentalAssignment() { } // Parameterless constructor for EF Core

    public RentalAssignment(Guid rentalId, Guid operatorId, Guid? assignedBy)
    {
        if (rentalId == Guid.Empty) throw new ArgumentException("RentalId is required.", nameof(rentalId));
        if (operatorId == Guid.Empty) throw new ArgumentException("OperatorId is required.", nameof(operatorId));

        RentalId = rentalId;
        OperatorId = operatorId;
        AssignedBy = assignedBy;
        AssignedAt = DateTime.UtcNow;
        AssignmentStatus = AssignmentStatus.Assigned;
        IsInvoiceGenerated = false;
    }

    public void Accept()
    {
        if (AssignmentStatus != AssignmentStatus.Assigned)
            throw new InvalidOperationException("Can only accept an assignment in Assigned status.");
        
        AssignmentStatus = AssignmentStatus.Accepted;
        Update();
    }

    public void Start(DateTime startDateTime, decimal startMeterReading, string? remarks)
    {
        if (AssignmentStatus != AssignmentStatus.Accepted)
            throw new InvalidOperationException("Can only start a rental that has been accepted.");
        if (startMeterReading < 0)
            throw new ArgumentException("Start meter reading cannot be negative.");

        ActualStartDateTime = startDateTime;
        StartMeterReading = startMeterReading;
        StartRemarks = remarks;
        AssignmentStatus = AssignmentStatus.Started;
        Update();
    }

    public void Complete(DateTime endDateTime, decimal endMeterReading, string? remarks)
    {
        if (AssignmentStatus != AssignmentStatus.Started)
            throw new InvalidOperationException("Can only complete a started assignment.");
        if (StartMeterReading.HasValue && endMeterReading < StartMeterReading.Value)
            throw new ArgumentException("End meter reading cannot be less than start meter reading.");
        if (ActualStartDateTime.HasValue && endDateTime < ActualStartDateTime.Value)
            throw new ArgumentException("End date/time cannot be before start date/time.");

        ActualEndDateTime = endDateTime;
        EndMeterReading = endMeterReading;
        CompletionRemarks = remarks;
        AssignmentStatus = AssignmentStatus.Completed;
        Update();
    }

    public void MarkInvoiceGenerated()
    {
        if (AssignmentStatus != AssignmentStatus.Completed)
            throw new InvalidOperationException("Cannot generate operator invoice before completion.");
        
        IsInvoiceGenerated = true;
        InvoiceGeneratedAt = DateTime.UtcNow;
        AssignmentStatus = AssignmentStatus.Closed;
        Update();
    }

    public void SetLastSynced()
    {
        LastSyncedAt = DateTime.UtcNow;
        Update();
    }
}
