using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelAssistant.Services.UserService.Models.Entities;

namespace UserService.Models
{
    public class Files
    {
        [Key]
        public int FilesId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Entity {  get; set; }
        [Required]
        public int EntityId  { get; set; }
        [Required]
        [MaxLength(255)]
        public string FileName { get; set; }
        [Required]
        [MaxLength(255)]
        public string FilePath { get; set; }
        [Required]
        [MaxLength(500)]
        public int FileSize { get; set; }
        [Required]
        public int UploadedBy { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [ForeignKey(nameof(UploadedBy))]
        public User? Uploader { get; set; }
    }
}
