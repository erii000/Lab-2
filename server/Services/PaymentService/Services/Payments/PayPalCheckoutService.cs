using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using TravelAssistant.Services.PaymentService.Configuration;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class PayPalCheckoutService
{
    private readonly HttpClient _httpClient;
    private readonly IPaymentRepository _paymentRepository;
    private readonly PayPalOptions _payPalOptions;

    public PayPalCheckoutService(
        HttpClient httpClient,
        IPaymentRepository paymentRepository,
        IOptions<PayPalOptions> payPalOptions)
    {
        _httpClient = httpClient;
        _paymentRepository = paymentRepository;
        _payPalOptions = payPalOptions.Value;
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_payPalOptions.ClientId) || string.IsNullOrWhiteSpace(_payPalOptions.ClientSecret))
            throw new InvalidOperationException("PayPal ClientId/ClientSecret is not configured.");

        var accessToken = await GetAccessTokenAsync(cancellationToken);
        var amount = request.Amount!.Value;
        var currency = request.Currency!.Trim().ToUpperInvariant();

        var payment = new Payment
        {
            UserId = userId,
            BookingId = request.BookingId,
            Amount = amount,
            Currency = currency,
            PaymentMethod = "paypal",
            PaymentStatus = "PendingCheckout",
            CreatedAt = DateTime.UtcNow
        };
        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _paymentRepository.SaveChangesAsync(cancellationToken);

        var orderRequest = new PayPalCreateOrderRequest
        {
            Intent = "CAPTURE",
            PurchaseUnits =
            [
                new PayPalPurchaseUnit
                {
                    ReferenceId = payment.Id.ToString(),
                    Amount = new PayPalMoney
                    {
                        CurrencyCode = currency,
                        Value = amount.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)
                    }
                }
            ],
            ApplicationContext = new PayPalApplicationContext
            {
                ReturnUrl = request.SuccessUrl,
                CancelUrl = request.CancelUrl
            }
        };

        using var orderHttpRequest = new HttpRequestMessage(HttpMethod.Post, "v2/checkout/orders");
        orderHttpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        orderHttpRequest.Content = JsonContent.Create(orderRequest);

        using var orderResponse = await _httpClient.SendAsync(orderHttpRequest, cancellationToken);
        var payload = await orderResponse.Content.ReadFromJsonAsync<PayPalCreateOrderResponse>(cancellationToken: cancellationToken);
        if (!orderResponse.IsSuccessStatusCode || payload is null || string.IsNullOrWhiteSpace(payload.Id))
            throw new InvalidOperationException("PayPal order creation failed.");

        var approveUrl = payload.Links?.FirstOrDefault(x => string.Equals(x.Rel, "approve", StringComparison.OrdinalIgnoreCase))?.Href;
        if (string.IsNullOrWhiteSpace(approveUrl))
            throw new InvalidOperationException("PayPal did not return an approval URL.");

        payment = (await _paymentRepository.GetTrackedByIdAsync(payment.Id, cancellationToken))!;
        payment.ExternalReference = payload.Id;
        payment.PaymentStatus = "AwaitingPayment";
        await _paymentRepository.SaveChangesAsync(cancellationToken);

        return new CreateCheckoutSessionResponse
        {
            PaymentId = payment.Id.ToString(),
            CheckoutUrl = approveUrl
        };
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var basic = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_payPalOptions.ClientId}:{_payPalOptions.ClientSecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/oauth2/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basic);
        request.Content = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("grant_type", "client_credentials")
        ]);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<PayPalTokenResponse>(cancellationToken: cancellationToken);
        if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(payload?.AccessToken))
            throw new InvalidOperationException("Unable to retrieve PayPal access token.");

        return payload.AccessToken;
    }

    private sealed class PayPalTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;
    }

    private sealed class PayPalCreateOrderRequest
    {
        [JsonPropertyName("intent")]
        public string Intent { get; set; } = "CAPTURE";

        [JsonPropertyName("purchase_units")]
        public List<PayPalPurchaseUnit> PurchaseUnits { get; set; } = [];

        [JsonPropertyName("application_context")]
        public PayPalApplicationContext ApplicationContext { get; set; } = new();
    }

    private sealed class PayPalPurchaseUnit
    {
        [JsonPropertyName("reference_id")]
        public string ReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("amount")]
        public PayPalMoney Amount { get; set; } = new();
    }

    private sealed class PayPalMoney
    {
        [JsonPropertyName("currency_code")]
        public string CurrencyCode { get; set; } = "USD";

        [JsonPropertyName("value")]
        public string Value { get; set; } = "0.00";
    }

    private sealed class PayPalApplicationContext
    {
        [JsonPropertyName("return_url")]
        public string ReturnUrl { get; set; } = string.Empty;

        [JsonPropertyName("cancel_url")]
        public string CancelUrl { get; set; } = string.Empty;
    }

    private sealed class PayPalCreateOrderResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("links")]
        public List<PayPalLink>? Links { get; set; }
    }

    private sealed class PayPalLink
    {
        [JsonPropertyName("href")]
        public string Href { get; set; } = string.Empty;

        [JsonPropertyName("rel")]
        public string Rel { get; set; } = string.Empty;
    }
}
