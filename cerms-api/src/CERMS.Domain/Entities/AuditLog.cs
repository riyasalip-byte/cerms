using CERMS.Domain.Common;
using System;

namespace CERMS.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string Action { get; private set; } // e.g. "CreateRole", "ModifyPermissions"
    public string TableName { get; private set; }
    public string PrimaryKey { get; private set; }
    public string ChangedBy { get; private set; }
    public string? OldValues { get; private set; } // JSON format representation
    public string? NewValues { get; private set; } // JSON format representation

    protected AuditLog() { }

    public AuditLog(string action, string tableName, string primaryKey, string changedBy, string? oldValues = null, string? newValues = null)
    {
        if (string.IsNullOrWhiteSpace(action)) throw new ArgumentException("Action is required.", nameof(action));
        if (string.IsNullOrWhiteSpace(tableName)) throw new ArgumentException("TableName is required.", nameof(tableName));
        if (string.IsNullOrWhiteSpace(primaryKey)) throw new ArgumentException("PrimaryKey is required.", nameof(primaryKey));
        if (string.IsNullOrWhiteSpace(changedBy)) throw new ArgumentException("ChangedBy is required.", nameof(changedBy));

        Action = action;
        TableName = tableName;
        PrimaryKey = primaryKey;
        ChangedBy = changedBy;
        OldValues = oldValues;
        NewValues = newValues;
    }
}
