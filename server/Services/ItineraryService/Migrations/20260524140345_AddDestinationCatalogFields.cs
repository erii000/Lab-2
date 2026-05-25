using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ItineraryService.Migrations
{
    /// <inheritdoc />
    public partial class AddDestinationCatalogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'dbo.Destinations', N'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.Destinations
                    (
                        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
                        Slug NVARCHAR(64) NOT NULL CONSTRAINT DF_Destinations_MigSlug DEFAULT (N''),
                        Name NVARCHAR(100) NOT NULL,
                        Country NVARCHAR(100) NOT NULL,
                        City NVARCHAR(100) NOT NULL,
                        Description NVARCHAR(2000) NULL,
                        ImageUrl NVARCHAR(500) NULL,
                        PriceFrom DECIMAL(10, 2) NULL,
                        Rating DECIMAL(3, 1) NULL,
                        ReviewCount INT NOT NULL CONSTRAINT DF_Destinations_MigReviewCount DEFAULT (0),
                        Tag NVARCHAR(80) NULL,
                        CatalogJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Destinations_MigCatalogJson DEFAULT (N'{}'),
                        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Destinations_MigCreatedAt DEFAULT (SYSUTCDATETIME()),
                        UpdatedAt DATETIME NULL
                    );
                END;

                IF COL_LENGTH(N'dbo.Destinations', N'Slug') IS NULL
                    ALTER TABLE dbo.Destinations ADD Slug NVARCHAR(64) NOT NULL CONSTRAINT DF_Destinations_MigSlug2 DEFAULT (N'');
                IF COL_LENGTH(N'dbo.Destinations', N'CatalogJson') IS NULL
                    ALTER TABLE dbo.Destinations ADD CatalogJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Destinations_MigCatalogJson2 DEFAULT (N'{}');
                IF COL_LENGTH(N'dbo.Destinations', N'ImageUrl') IS NULL
                    ALTER TABLE dbo.Destinations ADD ImageUrl NVARCHAR(500) NULL;
                IF COL_LENGTH(N'dbo.Destinations', N'PriceFrom') IS NULL
                    ALTER TABLE dbo.Destinations ADD PriceFrom DECIMAL(10, 2) NULL;
                IF COL_LENGTH(N'dbo.Destinations', N'Rating') IS NULL
                    ALTER TABLE dbo.Destinations ADD Rating DECIMAL(3, 1) NULL;
                IF COL_LENGTH(N'dbo.Destinations', N'ReviewCount') IS NULL
                    ALTER TABLE dbo.Destinations ADD ReviewCount INT NOT NULL CONSTRAINT DF_Destinations_MigReviewCount2 DEFAULT (0);
                IF COL_LENGTH(N'dbo.Destinations', N'Tag') IS NULL
                    ALTER TABLE dbo.Destinations ADD Tag NVARCHAR(80) NULL;

                DECLARE @descMax INT = (
                    SELECT CHARACTER_MAXIMUM_LENGTH
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = N'dbo' AND TABLE_NAME = N'Destinations' AND COLUMN_NAME = N'Description'
                );
                IF @descMax IS NOT NULL AND @descMax > 0 AND @descMax < 2000
                    ALTER TABLE dbo.Destinations ALTER COLUMN Description NVARCHAR(2000) NULL;

                UPDATE dbo.Destinations SET Slug = CONCAT(N'legacy-', Id) WHERE Slug = N'' OR Slug IS NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Destinations_Slug' AND object_id = OBJECT_ID(N'dbo.Destinations'))
                    CREATE UNIQUE INDEX IX_Destinations_Slug ON dbo.Destinations (Slug);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Destinations_Slug' AND object_id = OBJECT_ID(N'dbo.Destinations'))
                    DROP INDEX IX_Destinations_Slug ON dbo.Destinations;
                IF COL_LENGTH(N'dbo.Destinations', N'CatalogJson') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN CatalogJson;
                IF COL_LENGTH(N'dbo.Destinations', N'ImageUrl') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN ImageUrl;
                IF COL_LENGTH(N'dbo.Destinations', N'PriceFrom') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN PriceFrom;
                IF COL_LENGTH(N'dbo.Destinations', N'Rating') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN Rating;
                IF COL_LENGTH(N'dbo.Destinations', N'ReviewCount') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN ReviewCount;
                IF COL_LENGTH(N'dbo.Destinations', N'Slug') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN Slug;
                IF COL_LENGTH(N'dbo.Destinations', N'Tag') IS NOT NULL
                    ALTER TABLE dbo.Destinations DROP COLUMN Tag;
                """);
        }
    }
}
