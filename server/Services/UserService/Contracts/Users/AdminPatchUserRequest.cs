namespace TravelAssistant.Services.UserService.Contracts.Users;

public sealed class AdminPatchUserRequest
{
    public bool? IsActive { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
