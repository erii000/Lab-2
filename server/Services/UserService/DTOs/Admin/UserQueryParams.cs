namespace UserService.DTOs.Admin
{
    public class UserQueryParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }

    }
}
