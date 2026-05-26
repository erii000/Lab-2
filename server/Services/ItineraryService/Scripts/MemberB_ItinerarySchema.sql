/*
  Member B — ItineraryService persistence extensions (Azure SQL / MSSQL).
  Run once per environment after backup. Safe to re-run where IF NOT EXISTS guards apply.
*/

SET NOCOUNT ON;

IF COL_LENGTH(N'dbo.Itineraries', N'Destination') IS NULL
BEGIN
    ALTER TABLE dbo.Itineraries ADD Destination NVARCHAR(120) NULL;
    EXEC(N'UPDATE dbo.Itineraries SET Destination = LEFT(Title, 120) WHERE Destination IS NULL');
    ALTER TABLE dbo.Itineraries ALTER COLUMN Destination NVARCHAR(120) NOT NULL;
END;

IF COL_LENGTH(N'dbo.Itineraries', N'Country') IS NULL
    ALTER TABLE dbo.Itineraries ADD Country NVARCHAR(100) NULL;

IF COL_LENGTH(N'dbo.Itineraries', N'TimelineJson') IS NULL
    ALTER TABLE dbo.Itineraries ADD TimelineJson NVARCHAR(MAX) NULL;

DECLARE @descMax INT = (
    SELECT CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = N'dbo' AND TABLE_NAME = N'Itineraries' AND COLUMN_NAME = N'Description'
);
IF @descMax IS NOT NULL AND @descMax > 0 AND @descMax < 2000
    ALTER TABLE dbo.Itineraries ALTER COLUMN Description NVARCHAR(2000) NULL;

IF OBJECT_ID(N'dbo.ItineraryDays', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ItineraryDays
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        ItineraryId INT NOT NULL,
        DayNumber INT NOT NULL,
        [Date] DATE NOT NULL,
        TransportSuggestion NVARCHAR(200) NOT NULL,
        MealSuggestion NVARCHAR(200) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ItineraryDays_CreatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT FK_ItineraryDays_Itineraries FOREIGN KEY (ItineraryId)
            REFERENCES dbo.Itineraries (Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_ItineraryDays_ItineraryId ON dbo.ItineraryDays (ItineraryId);
END;

IF OBJECT_ID(N'dbo.ItineraryDayActivities', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ItineraryDayActivities
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        ItineraryDayId INT NOT NULL,
        SortOrder INT NOT NULL,
        Description NVARCHAR(500) NOT NULL,
        CONSTRAINT FK_ItineraryDayActivities_Days FOREIGN KEY (ItineraryDayId)
            REFERENCES dbo.ItineraryDays (Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_ItineraryDayActivities_DayId ON dbo.ItineraryDayActivities (ItineraryDayId);
END;

IF OBJECT_ID(N'dbo.TravelPreferences', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TravelPreferences
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        PreferredTransport NVARCHAR(100) NULL,
        PreferredAccommodation NVARCHAR(100) NULL,
        BudgetMin DECIMAL(10, 2) NULL,
        BudgetMax DECIMAL(10, 2) NULL,
        FavoriteDestinationType NVARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_TravelPreferences_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME2 NULL
    );
    CREATE INDEX IX_TravelPreferences_UserId ON dbo.TravelPreferences (UserId);
END;
