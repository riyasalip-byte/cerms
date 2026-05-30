using Microsoft.AspNetCore.Authorization;
using System;

namespace CERMS.Infrastructure.Security;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
public class AuthorizePermissionAttribute : AuthorizeAttribute
{
    public AuthorizePermissionAttribute(string permission) : base(policy: permission)
    {
    }
}
