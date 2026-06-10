/*
  Idempotent bootstrap for shared lab2DB — Booking + Itinerary Member B tables.
  Safe to re-run (Docker, Azure, local). Run before EF migrations on empty or partial DBs.
*/
SET NOCOUNT ON;

/* ---- Itinerary: Destinations (full catalog schema) ---- */
IF OBJECT_ID(N'dbo.Destinations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Destinations
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        Slug NVARCHAR(64) NOT NULL CONSTRAINT DF_Destinations_Slug DEFAULT (N''),
        Name NVARCHAR(100) NOT NULL,
        Country NVARCHAR(100) NOT NULL,
        City NVARCHAR(100) NOT NULL,
        Description NVARCHAR(2000) NULL,
        ImageUrl NVARCHAR(500) NULL,
        PriceFrom DECIMAL(10, 2) NULL,
        Rating DECIMAL(3, 1) NULL,
        ReviewCount INT NOT NULL CONSTRAINT DF_Destinations_ReviewCount DEFAULT (0),
        Tag NVARCHAR(80) NULL,
        CatalogJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Destinations_CatalogJson DEFAULT (N'{}'),
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Destinations_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE UNIQUE INDEX IX_Destinations_Slug ON dbo.Destinations (Slug);
END
ELSE
BEGIN
    IF COL_LENGTH(N'dbo.Destinations', N'Slug') IS NULL
        ALTER TABLE dbo.Destinations ADD Slug NVARCHAR(64) NOT NULL CONSTRAINT DF_Destinations_Slug2 DEFAULT (N'');
    IF COL_LENGTH(N'dbo.Destinations', N'CatalogJson') IS NULL
        ALTER TABLE dbo.Destinations ADD CatalogJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Destinations_CatalogJson2 DEFAULT (N'{}');
    IF COL_LENGTH(N'dbo.Destinations', N'ImageUrl') IS NULL
        ALTER TABLE dbo.Destinations ADD ImageUrl NVARCHAR(500) NULL;
    IF COL_LENGTH(N'dbo.Destinations', N'PriceFrom') IS NULL
        ALTER TABLE dbo.Destinations ADD PriceFrom DECIMAL(10, 2) NULL;
    IF COL_LENGTH(N'dbo.Destinations', N'Rating') IS NULL
        ALTER TABLE dbo.Destinations ADD Rating DECIMAL(3, 1) NULL;
    IF COL_LENGTH(N'dbo.Destinations', N'ReviewCount') IS NULL
        ALTER TABLE dbo.Destinations ADD ReviewCount INT NOT NULL CONSTRAINT DF_Destinations_ReviewCount2 DEFAULT (0);
    IF COL_LENGTH(N'dbo.Destinations', N'Tag') IS NULL
        ALTER TABLE dbo.Destinations ADD Tag NVARCHAR(80) NULL;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Destinations_Slug' AND object_id = OBJECT_ID(N'dbo.Destinations'))
    BEGIN
        EXEC(N'UPDATE dbo.Destinations SET Slug = CONCAT(N''legacy-'', Id) WHERE Slug = N'''' OR Slug IS NULL');
        EXEC(N'CREATE UNIQUE INDEX IX_Destinations_Slug ON dbo.Destinations (Slug)');
    END;
END;

/* ---- Itinerary: Itineraries ---- */
IF OBJECT_ID(N'dbo.Itineraries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Itineraries
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(100) NOT NULL,
        Destination NVARCHAR(120) NOT NULL,
        Country NVARCHAR(100) NULL,
        Description NVARCHAR(2000) NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Itineraries_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_Itineraries_UserId ON dbo.Itineraries (UserId);
END;

IF COL_LENGTH(N'dbo.Itineraries', N'Destination') IS NULL
BEGIN
    ALTER TABLE dbo.Itineraries ADD Destination NVARCHAR(120) NULL;
    EXEC(N'UPDATE dbo.Itineraries SET Destination = LEFT(Title, 120) WHERE Destination IS NULL');
    ALTER TABLE dbo.Itineraries ALTER COLUMN Destination NVARCHAR(120) NOT NULL;
END;

IF COL_LENGTH(N'dbo.Itineraries', N'TimelineJson') IS NULL
    ALTER TABLE dbo.Itineraries ADD TimelineJson NVARCHAR(MAX) NULL;

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

IF OBJECT_ID(N'dbo.Trips', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Trips
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(100) NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        Budget DECIMAL(10, 2) NULL,
        Status NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Trips_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_Trips_UserId ON dbo.Trips (UserId);
END;

IF OBJECT_ID(N'dbo.TripDestinations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TripDestinations
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        TripId INT NOT NULL,
        DestinationId INT NOT NULL,
        VisitDate DATE NULL,
        CONSTRAINT FK_TripDestinations_Trips FOREIGN KEY (TripId)
            REFERENCES dbo.Trips (Id) ON DELETE CASCADE,
        CONSTRAINT FK_TripDestinations_Destinations FOREIGN KEY (DestinationId)
            REFERENCES dbo.Destinations (Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_TripDestinations_TripId ON dbo.TripDestinations (TripId);
    CREATE INDEX IX_TripDestinations_DestinationId ON dbo.TripDestinations (DestinationId);
END;

IF OBJECT_ID(N'dbo.TripParticipants', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TripParticipants
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        TripId INT NOT NULL,
        UserId INT NOT NULL,
        Role NVARCHAR(50) NULL,
        JoinedAt DATETIME NOT NULL CONSTRAINT DF_TripParticipants_JoinedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT FK_TripParticipants_Trips FOREIGN KEY (TripId)
            REFERENCES dbo.Trips (Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_TripParticipants_TripId ON dbo.TripParticipants (TripId);
    CREATE INDEX IX_TripParticipants_UserId ON dbo.TripParticipants (UserId);
END;

/* ---- Booking: Bookings ---- */
IF OBJECT_ID(N'dbo.Bookings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Bookings
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        ItineraryId INT NULL,
        BookingType NVARCHAR(50) NOT NULL,
        Provider NVARCHAR(100) NOT NULL,
        ReferenceCode NVARCHAR(100) NOT NULL,
        Amount DECIMAL(10, 2) NULL,
        Currency NVARCHAR(10) NULL,
        BookingDate DATE NOT NULL,
        Status NVARCHAR(50) NOT NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_Bookings_UserId ON dbo.Bookings (UserId);
END;

IF COL_LENGTH(N'dbo.Bookings', N'Provider') IS NULL
    ALTER TABLE dbo.Bookings ADD Provider NVARCHAR(100) NOT NULL CONSTRAINT DF_Bookings_Provider DEFAULT (N'');
IF COL_LENGTH(N'dbo.Bookings', N'ReferenceCode') IS NULL
    ALTER TABLE dbo.Bookings ADD ReferenceCode NVARCHAR(100) NOT NULL CONSTRAINT DF_Bookings_ReferenceCode DEFAULT (N'');
IF COL_LENGTH(N'dbo.Bookings', N'Amount') IS NULL
    ALTER TABLE dbo.Bookings ADD Amount DECIMAL(10, 2) NULL;
IF COL_LENGTH(N'dbo.Bookings', N'Currency') IS NULL
    ALTER TABLE dbo.Bookings ADD Currency NVARCHAR(10) NULL;
IF COL_LENGTH(N'dbo.Bookings', N'MetadataJson') IS NULL
    ALTER TABLE dbo.Bookings ADD MetadataJson NVARCHAR(MAX) NULL;

IF OBJECT_ID(N'dbo.Flights', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Flights
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        FromCity NVARCHAR(100) NOT NULL,
        ToCity NVARCHAR(100) NOT NULL,
        DepartureDate DATETIME NOT NULL,
        ArrivalDate DATETIME NOT NULL,
        Airline NVARCHAR(100) NULL,
        Price DECIMAL(10, 2) NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Flights_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_Flights_UserId ON dbo.Flights (UserId);
END;

IF OBJECT_ID(N'dbo.Hotels', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Hotels
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        DestinationId INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Address NVARCHAR(255) NULL,
        Rating DECIMAL(2, 1) NULL,
        PricePerNight DECIMAL(10, 2) NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Hotels_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_Hotels_DestinationId ON dbo.Hotels (DestinationId);
END;

IF OBJECT_ID(N'dbo.SavedTrips', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SavedTrips
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        TripId INT NOT NULL,
        SavedAt DATETIME NOT NULL CONSTRAINT DF_SavedTrips_SavedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_SavedTrips_UserId ON dbo.SavedTrips (UserId);
    CREATE INDEX IX_SavedTrips_TripId ON dbo.SavedTrips (TripId);
END;

IF OBJECT_ID(N'dbo.UserSavedDestinations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserSavedDestinations
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        DestinationSlug NVARCHAR(64) NOT NULL,
        SavedAt DATETIME2 NOT NULL CONSTRAINT DF_UserSavedDestinations_SavedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE UNIQUE INDEX UX_UserSavedDestinations_User_Slug ON dbo.UserSavedDestinations (UserId, DestinationSlug);
    CREATE INDEX IX_UserSavedDestinations_UserId ON dbo.UserSavedDestinations (UserId);
END;

IF OBJECT_ID(N'dbo.TransportOptions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TransportOptions
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        DestinationId INT NOT NULL,
        [Type] NVARCHAR(50) NOT NULL,
        Provider NVARCHAR(100) NULL,
        Price DECIMAL(10, 2) NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_TransportOptions_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME NULL
    );
    CREATE INDEX IX_TransportOptions_DestinationId ON dbo.TransportOptions (DestinationId);
END;

/* ---- Payment: Payments ---- */
IF OBJECT_ID(N'dbo.Payments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Payments
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        BookingId INT NOT NULL,
        Amount DECIMAL(10, 2) NOT NULL,
        Currency NVARCHAR(10) NULL,
        PaymentMethod NVARCHAR(50) NOT NULL,
        PaymentStatus NVARCHAR(50) NOT NULL,
        ExternalReference NVARCHAR(255) NULL,
        PaidAt DATETIME NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_Payments_UserId ON dbo.Payments (UserId);
    CREATE INDEX IX_Payments_BookingId ON dbo.Payments (BookingId);
    CREATE INDEX IX_Payments_ExternalReference ON dbo.Payments (ExternalReference);
END;

IF COL_LENGTH(N'dbo.Payments', N'Currency') IS NULL
    ALTER TABLE dbo.Payments ADD Currency NVARCHAR(10) NULL;
IF COL_LENGTH(N'dbo.Payments', N'ExternalReference') IS NULL
    ALTER TABLE dbo.Payments ADD ExternalReference NVARCHAR(255) NULL;
IF COL_LENGTH(N'dbo.Payments', N'PaidAt') IS NULL
    ALTER TABLE dbo.Payments ADD PaidAt DATETIME NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_ExternalReference' AND object_id = OBJECT_ID(N'dbo.Payments')
)
    CREATE INDEX IX_Payments_ExternalReference ON dbo.Payments (ExternalReference);

/* ---- Payment: Expenses ---- */
IF OBJECT_ID(N'dbo.Expenses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Expenses
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        TripId INT NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Amount DECIMAL(10, 2) NOT NULL,
        Description NVARCHAR(255) NULL,
        ExpenseDate DATE NOT NULL,
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_Expenses_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_Expenses_UserId ON dbo.Expenses (UserId);
    CREATE INDEX IX_Expenses_TripId ON dbo.Expenses (TripId);
END;

/* ---- Real-time: chat messages ---- */
IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChatMessages
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        SenderUserId INT NOT NULL,
        ReceiverUserId INT NOT NULL,
        Message NVARCHAR(2000) NOT NULL,
        SentAt DATETIME2 NOT NULL CONSTRAINT DF_ChatMessages_SentAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_ChatMessages_SenderUserId ON dbo.ChatMessages (SenderUserId);
    CREATE INDEX IX_ChatMessages_ReceiverUserId ON dbo.ChatMessages (ReceiverUserId);
END;
GO

/* Upgrade legacy ChatMessages (separate batch — SQL Server validates both IF/ELSE branches). */
IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'SenderUserId') IS NULL
BEGIN
    ALTER TABLE dbo.ChatMessages ADD SenderUserId INT NULL;
    IF COL_LENGTH(N'dbo.ChatMessages', N'UserId') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET SenderUserId = UserId WHERE SenderUserId IS NULL');
    IF COL_LENGTH(N'dbo.ChatMessages', N'FromUserId') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET SenderUserId = FromUserId WHERE SenderUserId IS NULL');
    EXEC(N'UPDATE dbo.ChatMessages SET SenderUserId = 0 WHERE SenderUserId IS NULL');
    EXEC(N'ALTER TABLE dbo.ChatMessages ALTER COLUMN SenderUserId INT NOT NULL');
END;
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'ReceiverUserId') IS NULL
BEGIN
    ALTER TABLE dbo.ChatMessages ADD ReceiverUserId INT NULL;
    IF COL_LENGTH(N'dbo.ChatMessages', N'ToUserId') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET ReceiverUserId = ToUserId WHERE ReceiverUserId IS NULL');
    ELSE
        EXEC(N'UPDATE dbo.ChatMessages SET ReceiverUserId = 0 WHERE ReceiverUserId IS NULL');
    EXEC(N'ALTER TABLE dbo.ChatMessages ALTER COLUMN ReceiverUserId INT NOT NULL');
END;
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Message') IS NULL
BEGIN
    ALTER TABLE dbo.ChatMessages ADD Message NVARCHAR(2000) NULL;
    IF COL_LENGTH(N'dbo.ChatMessages', N'Content') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET Message = Content WHERE Message IS NULL');
    IF COL_LENGTH(N'dbo.ChatMessages', N'Text') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET Message = Text WHERE Message IS NULL');
    IF COL_LENGTH(N'dbo.ChatMessages', N'Body') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET Message = Body WHERE Message IS NULL');
    EXEC(N'UPDATE dbo.ChatMessages SET Message = N'''' WHERE Message IS NULL');
    EXEC(N'ALTER TABLE dbo.ChatMessages ALTER COLUMN Message NVARCHAR(2000) NOT NULL');
END;
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'SentAt') IS NULL
BEGIN
    ALTER TABLE dbo.ChatMessages ADD SentAt DATETIME2 NULL;
    IF COL_LENGTH(N'dbo.ChatMessages', N'CreatedAt') IS NOT NULL
        EXEC(N'UPDATE dbo.ChatMessages SET SentAt = CreatedAt WHERE SentAt IS NULL');
    EXEC(N'UPDATE dbo.ChatMessages SET SentAt = SYSUTCDATETIME() WHERE SentAt IS NULL');
    EXEC(N'ALTER TABLE dbo.ChatMessages ALTER COLUMN SentAt DATETIME2 NOT NULL');
END;
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatMessages_SenderUserId' AND object_id = OBJECT_ID(N'dbo.ChatMessages'))
        CREATE INDEX IX_ChatMessages_SenderUserId ON dbo.ChatMessages (SenderUserId);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChatMessages_ReceiverUserId' AND object_id = OBJECT_ID(N'dbo.ChatMessages'))
        CREATE INDEX IX_ChatMessages_ReceiverUserId ON dbo.ChatMessages (ReceiverUserId);
END;
GO

/* Keep legacy UserId in sync with SenderUserId (shared lab DB retains NOT NULL UserId + FK). */
IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'SenderUserId') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'UserId') IS NOT NULL
    EXEC(N'UPDATE dbo.ChatMessages SET SenderUserId = UserId, UserId = SenderUserId WHERE SenderUserId = 0 OR UserId = 0');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Message') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Content') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN Content');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Message') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Text') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN Text');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Message') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'Body') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN Body');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'SentAt') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'CreatedAt') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN CreatedAt');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'ReceiverUserId') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'ToUserId') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN ToUserId');
GO

IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'SenderUserId') IS NOT NULL
   AND COL_LENGTH(N'dbo.ChatMessages', N'FromUserId') IS NOT NULL
    EXEC(N'ALTER TABLE dbo.ChatMessages DROP COLUMN FromUserId');
GO

/* ---- Support: tickets (contact form) ---- */
IF OBJECT_ID(N'dbo.SupportTickets', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SupportTickets
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        Subject NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(50) NOT NULL CONSTRAINT DF_SupportTickets_Status DEFAULT (N'Open'),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SupportTickets_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_SupportTickets_UserId ON dbo.SupportTickets (UserId);
END
ELSE
BEGIN
    IF COL_LENGTH(N'dbo.SupportTickets', N'Description') IS NULL
       AND COL_LENGTH(N'dbo.SupportTickets', N'Message') IS NOT NULL
        EXEC sp_rename N'dbo.SupportTickets.Message', N'Description', N'COLUMN';
    IF COL_LENGTH(N'dbo.SupportTickets', N'Description') IS NULL
        ALTER TABLE dbo.SupportTickets ADD Description NVARCHAR(MAX) NOT NULL CONSTRAINT DF_SupportTickets_Description DEFAULT (N'');
    IF COL_LENGTH(N'dbo.SupportTickets', N'Message') IS NOT NULL
       AND COL_LENGTH(N'dbo.SupportTickets', N'Description') IS NOT NULL
    BEGIN
        EXEC(N'UPDATE dbo.SupportTickets SET Description = Message WHERE (Description IS NULL OR Description = N'''') AND Message IS NOT NULL');
        ALTER TABLE dbo.SupportTickets DROP COLUMN Message;
    END;
    IF COL_LENGTH(N'dbo.SupportTickets', N'Status') IS NULL
        ALTER TABLE dbo.SupportTickets ADD Status NVARCHAR(50) NOT NULL CONSTRAINT DF_SupportTickets_Status2 DEFAULT (N'Open');
    IF COL_LENGTH(N'dbo.SupportTickets', N'CreatedAt') IS NULL
        ALTER TABLE dbo.SupportTickets ADD CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SupportTickets_CreatedAt2 DEFAULT (SYSUTCDATETIME());
END;

/* ---- Notifications (in-app alerts) ---- */
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(2000) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_Notifications_UserId ON dbo.Notifications (UserId);
END
ELSE
BEGIN
    IF COL_LENGTH(N'dbo.Notifications', N'Type') IS NULL
        ALTER TABLE dbo.Notifications ADD Type NVARCHAR(50) NOT NULL CONSTRAINT DF_Notifications_Type DEFAULT (N'system');
    IF COL_LENGTH(N'dbo.Notifications', N'IsRead') IS NULL
        ALTER TABLE dbo.Notifications ADD IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead2 DEFAULT (0);
    IF COL_LENGTH(N'dbo.Notifications', N'CreatedAt') IS NULL
        ALTER TABLE dbo.Notifications ADD CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt2 DEFAULT (SYSUTCDATETIME());
    IF COL_LENGTH(N'dbo.Notifications', N'Audience') IS NULL
        ALTER TABLE dbo.Notifications ADD Audience NVARCHAR(20) NULL;
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'UserId' AND is_nullable = 0)
        ALTER TABLE dbo.Notifications ALTER COLUMN UserId INT NULL;
END;

/* Admin ops feed rows use Audience='admin' with NULL UserId (no FK to Users). */
IF COL_LENGTH(N'dbo.Notifications', N'Audience') IS NULL
    ALTER TABLE dbo.Notifications ADD Audience NVARCHAR(20) NULL;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Notifications_Users' AND parent_object_id = OBJECT_ID(N'dbo.Notifications'))
    ALTER TABLE dbo.Notifications DROP CONSTRAINT FK_Notifications_Users;

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'UserId' AND is_nullable = 0)
    ALTER TABLE dbo.Notifications ALTER COLUMN UserId INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Notifications_Users' AND parent_object_id = OBJECT_ID(N'dbo.Notifications'))
   AND OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
    ALTER TABLE dbo.Notifications WITH NOCHECK
        ADD CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id);

/* ---- Audit: immutable action log ---- */
IF OBJECT_ID(N'dbo.AuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs
    (
        Id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        UserId INT NULL,
        Action NVARCHAR(100) NOT NULL,
        EntityName NVARCHAR(100) NOT NULL,
        Details NVARCHAR(2000) NOT NULL CONSTRAINT DF_AuditLogs_Details DEFAULT (N''),
        CreatedAt DATETIME NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
    CREATE INDEX IX_AuditLogs_UserId ON dbo.AuditLogs (UserId);
    CREATE INDEX IX_AuditLogs_EntityName ON dbo.AuditLogs (EntityName);
    CREATE INDEX IX_AuditLogs_CreatedAt ON dbo.AuditLogs (CreatedAt);
END
ELSE
BEGIN
    IF COL_LENGTH(N'dbo.AuditLogs', N'Details') IS NULL
        ALTER TABLE dbo.AuditLogs ADD Details NVARCHAR(2000) NOT NULL CONSTRAINT DF_AuditLogs_Details2 DEFAULT (N'');
    IF COL_LENGTH(N'dbo.AuditLogs', N'EntityName') IS NULL AND COL_LENGTH(N'dbo.AuditLogs', N'Entity') IS NOT NULL
        EXEC sp_rename N'dbo.AuditLogs.Entity', N'EntityName', N'COLUMN';
    IF COL_LENGTH(N'dbo.AuditLogs', N'EntityName') IS NULL
        ALTER TABLE dbo.AuditLogs ADD EntityName NVARCHAR(100) NOT NULL CONSTRAINT DF_AuditLogs_EntityName DEFAULT (N'');
    IF COL_LENGTH(N'dbo.AuditLogs', N'Entity') IS NOT NULL AND COL_LENGTH(N'dbo.AuditLogs', N'EntityName') IS NOT NULL
    BEGIN
        EXEC(N'UPDATE dbo.AuditLogs SET EntityName = Entity WHERE (EntityName IS NULL OR EntityName = N'''') AND Entity IS NOT NULL');
        DECLARE @dropAuditEntity NVARCHAR(400) = N'ALTER TABLE dbo.AuditLogs DROP COLUMN Entity';
        EXEC sp_executesql @dropAuditEntity;
    END;
    IF COL_LENGTH(N'dbo.AuditLogs', N'Action') IS NULL
        ALTER TABLE dbo.AuditLogs ADD Action NVARCHAR(100) NOT NULL CONSTRAINT DF_AuditLogs_Action DEFAULT (N'');
    IF COL_LENGTH(N'dbo.AuditLogs', N'CreatedAt') IS NULL
        ALTER TABLE dbo.AuditLogs ADD CreatedAt DATETIME NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt2 DEFAULT (SYSUTCDATETIME());
END;

/* ---- Payment: webhook / audit log ---- */
IF OBJECT_ID(N'dbo.PaymentTransactionLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PaymentTransactionLogs
    (
        Id BIGINT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        PaymentId INT NULL,
        Provider NVARCHAR(50) NOT NULL,
        ExternalEventId NVARCHAR(100) NOT NULL,
        EventType NVARCHAR(120) NOT NULL,
        Payload NVARCHAR(MAX) NULL,
        ProcessedOk BIT NOT NULL,
        ErrorMessage NVARCHAR(2000) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_PaymentTransactionLogs_CreatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT FK_PaymentTransactionLogs_Payments FOREIGN KEY (PaymentId)
            REFERENCES dbo.Payments (Id) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX UX_PaymentTransactionLogs_ExternalEventId ON dbo.PaymentTransactionLogs (ExternalEventId);
END;
