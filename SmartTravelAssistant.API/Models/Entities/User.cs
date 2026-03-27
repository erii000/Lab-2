using System.Collections.Generic;

namespace SmartTravelAssistant.API.Models.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public bool IsActive { get; set; } = true;


        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
