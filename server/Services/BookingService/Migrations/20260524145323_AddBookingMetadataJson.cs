using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookingService.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingMetadataJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.Bookings', N'MetadataJson') IS NULL
                    ALTER TABLE dbo.Bookings ADD MetadataJson NVARCHAR(MAX) NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.Bookings', N'MetadataJson') IS NOT NULL
                    ALTER TABLE dbo.Bookings DROP COLUMN MetadataJson;
                """);
        }
    }
}
