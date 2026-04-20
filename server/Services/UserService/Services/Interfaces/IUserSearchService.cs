using TravelAssistant.Services.UserService.Contracts.Users;

namespace TravelAssistant.Services.UserService.Services.Interfaces;

public interface IUserSearchService
{
    Task<PagedResult<UserSearchItemResponse>> SearchAsync(UserSearchRequest request, CancellationToken cancellationToken = default);
}
