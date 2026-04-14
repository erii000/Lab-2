/*
  Member B — BookingService: columns required by API contract (provider, reference, money).
*/

SET NOCOUNT ON;

IF COL_LENGTH(N'dbo.Bookings', N'Provider') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings ADD Provider NVARCHAR(100) NOT NULL CONSTRAINT DF_Bookings_Provider DEFAULT (N'');
    ALTER TABLE dbo.Bookings DROP CONSTRAINT DF_Bookings_Provider;
END;

IF COL_LENGTH(N'dbo.Bookings', N'ReferenceCode') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings ADD ReferenceCode NVARCHAR(100) NOT NULL CONSTRAINT DF_Bookings_ReferenceCode DEFAULT (N'');
    ALTER TABLE dbo.Bookings DROP CONSTRAINT DF_Bookings_ReferenceCode;
END;

IF COL_LENGTH(N'dbo.Bookings', N'Amount') IS NULL
    ALTER TABLE dbo.Bookings ADD Amount DECIMAL(10, 2) NULL;

IF COL_LENGTH(N'dbo.Bookings', N'Currency') IS NULL
    ALTER TABLE dbo.Bookings ADD Currency NVARCHAR(10) NULL;
