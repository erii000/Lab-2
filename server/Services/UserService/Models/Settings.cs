using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class Settings
    {
        [Key]
        public int SettingsId { get; set; }
        [Required]
        [MaxLength(100)]
        [Column("Key")]
        public string SettingsKey { get; set; } = string.Empty;
        [Required]
        [MaxLength(255)]
        [Column("Value")]
        public string SettingsValue { get; set; }
        [MaxLength(255)]
        public string Description { get; set; }
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;


    }
}
