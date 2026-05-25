using UserEntity = TravelAssistant.Services.UserService.Models.Entities.User;

namespace UserService.DTOs.Admin;

internal static class UserListMapper
{
    public static object ToListItem(UserEntity user) => new
    {
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.IsActive,
        user.CreatedAt,
        Roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Name)
            .Distinct()
            .ToList()
    };

    public static object ToPagedResponse(
        IEnumerable<UserEntity> users,
        int totalCount,
        UserQueryParams query) =>
        new
        {
            TotalCount = totalCount,
            PageSize = query.PageSize,
            CurrentPage = query.PageNumber,
            Items = users.Select(ToListItem).ToList()
        };
}
