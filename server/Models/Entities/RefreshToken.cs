namespace SmartTravelAssistant.API.Models.Entities
{
    public class RefreshToken : BaseEntity 
    {
        public string Token { get; set;}
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }


        public int UserId { get; set; }
        public User User { get; set; }
    }
}
