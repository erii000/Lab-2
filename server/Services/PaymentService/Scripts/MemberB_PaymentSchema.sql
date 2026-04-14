/*
  Member B — PaymentService: Stripe references, currency, and durable webhook / audit log.
*/

SET NOCOUNT ON;

IF COL_LENGTH(N'dbo.Payments', N'Currency') IS NULL
    ALTER TABLE dbo.Payments ADD Currency NVARCHAR(10) NULL;

IF COL_LENGTH(N'dbo.Payments', N'ExternalReference') IS NULL
    ALTER TABLE dbo.Payments ADD ExternalReference NVARCHAR(255) NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_ExternalReference' AND object_id = OBJECT_ID(N'dbo.Payments')
)
    CREATE INDEX IX_Payments_ExternalReference ON dbo.Payments (ExternalReference);

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
