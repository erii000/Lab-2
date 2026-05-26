using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAssistant.Services.ItineraryService.Migrations;

public partial class AddItineraryTimelineJson : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "TimelineJson",
            table: "Itineraries",
            type: "nvarchar(max)",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "TimelineJson",
            table: "Itineraries");
    }
}
