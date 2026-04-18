using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models
{
    public class TripDestination
    {
        [Key]
        public int TripDestinationId { get; set; }
        [Required]
        public int TripId { get; set; }
        [Required] 
        public int DestinationId { get; set; }
        public DateTime VisitDate { get; set; }
        [ForeignKey(nameof(TripId))]
        public Trips? Trips { get; set; }
        [ForeignKey(nameof(DestinationId))]
        public Destinations? Destinations { get; set; }

    }
}
