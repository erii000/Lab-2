using TravelAssistant.Services.BookingService.DTOs.Bookings;

namespace TravelAssistant.Services.BookingService.Services.Bookings;

public interface IBookingImportService
{
    Task<(int Inserted, IReadOnlyList<object> Errors)> ImportAsync(
        IReadOnlyList<BookingImportRow> rows,
        CancellationToken cancellationToken = default);
}

public sealed class BookingImportRow
{
    public int UserId { get; set; }
    public int ItineraryId { get; set; }
    public string BookingType { get; set; } = "";
    public string Provider { get; set; } = "";
    public string ReferenceCode { get; set; } = "";
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
}

public sealed class BookingImportService : IBookingImportService
{
    private readonly IBookingWorkflowService _bookingWorkflowService;

    public BookingImportService(IBookingWorkflowService bookingWorkflowService) =>
        _bookingWorkflowService = bookingWorkflowService;

    public async Task<(int Inserted, IReadOnlyList<object> Errors)> ImportAsync(
        IReadOnlyList<BookingImportRow> rows,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<object>();
        for (var i = 0; i < rows.Count; i++)
        {
            var r = rows[i];
            if (r.UserId <= 0 || r.ItineraryId <= 0 || string.IsNullOrWhiteSpace(r.BookingType) ||
                string.IsNullOrWhiteSpace(r.Provider) || string.IsNullOrWhiteSpace(r.ReferenceCode))
                errors.Add(new { row = i + 1, message = "Invalid required fields." });
        }

        if (errors.Count > 0)
            return (0, errors);

        foreach (var r in rows)
        {
            await _bookingWorkflowService.CreateAsync(r.UserId, new CreateBookingRequest
            {
                ItineraryId = r.ItineraryId,
                BookingType = r.BookingType,
                Provider = r.Provider,
                ReferenceCode = r.ReferenceCode,
                Amount = r.Amount,
                Currency = r.Currency
            }, cancellationToken);
        }

        return (rows.Count, Array.Empty<object>());
    }
}
