using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class Permissions
    {
        [Key]
        public int PermissionId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(255)]
        public string Description {  get; set; }
    }
}
