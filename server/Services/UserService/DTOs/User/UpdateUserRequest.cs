using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs.User
{
    public sealed class UpdateUserRequest
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;
    }
}
