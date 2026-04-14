using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class RolePermissions
    {
        [Key]
        public int RolePermissionId { get; set; }
        [Required]
        public int RoleId { get; set; }
        [Required]
        public int PermissionId { get; set; }

        [ForeignKey(nameof(RoleId))]
        public Roles? Roles { get; set; }
        [ForeignKey(nameof(PermissionId))]
        public Permissions? Permissions { get; set; }
    }
}
