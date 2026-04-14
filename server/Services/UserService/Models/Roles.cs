using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class Roles
    {
        [Key]
        public int RolesId { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [MaxLength(255)]
        public string Description { get; set; } 
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }
}
