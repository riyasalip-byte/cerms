using AutoMapper;
using CERMS.Application.Common;
using CERMS.Application.DTOs;
using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CERMS.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand : IRequest<Result<UserDto>>
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public Guid RoleId { get; init; }
    public bool IsActive { get; init; }
}

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateUserHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Repository<User>().Entities
            .Include(u => u.Role)
            .Include(u => u.Staff)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user is null)
            return Result<UserDto>.Failure("User not found.");

        var duplicate = await _unitOfWork.Repository<User>().Entities
            .AnyAsync(u => u.Id != request.Id &&
                           (u.Username == request.Username || u.Email == request.Email),
                cancellationToken);

        if (duplicate)
            return Result<UserDto>.Failure("Username or email already in use.");

        user.UpdateProfile(request.Username.Trim(), request.Email.Trim());
        user.UpdateRole(request.RoleId);

        if (request.IsActive)
            user.Activate();
        else
            user.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<UserDto>.Success(_mapper.Map<UserDto>(user));
    }
}
