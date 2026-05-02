using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using TravelAssistant.Services.PaymentService.Configuration;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class PayPalPaymentWebhookService
{
    private readonly HttpClient _httpClient;
    private readonly IPaymentRepository _paymentRepository;
    private readonly PayPalOptions _payPalOptions;

    public PayPalPaymentWebhookService(
        HttpClient httpClient,
        IPaymentRepository paymentRepository,
        IOptions<PayPalOptions> payPalOptions)
    {
        _httpClient = httpClient;
        _paymentRepository = paymentRepository;
        _payPalOptions = payPalOptions.Value;
    }

    public async Task<bool> ProcessAsync(string json, IHeaderDictionary headers, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_payPalOptions.ClientId) ||
            string.IsNullOrWhiteSpace(_payPalOptions.ClientSecret) ||
            string.IsNullOrWhiteSpace(_payPalOptions.WebhookId))
        {
            return false;
        }

        var transmissionId = headers["PAYPAL-TRANSMISSION-ID"].ToString();
        var transmissionTime = headers["PAYPAL-TRANSMISSION-TIME"].ToString();
        var transmissionSig = headers["PAYPAL-TRANSMISSION-SIG"].ToString();
        var certUrl = headers["PAYPAL-CERT-URL"].ToString();
        var authAlgo = headers["PAYPAL-AUTH-ALGO"].ToString();

        if (string.IsNullOrWhiteSpace(transmissionId) ||
            string.IsNullOrWhiteSpace(transmissionTime) ||
            string.IsNullOrWhiteSpace(transmissionSig) ||
            string.IsNullOrWhiteSpace(certUrl) ||
            string.IsNullOrWhiteSpace(authAlgo))
        {
            return false;
        }

        var payload = JsonSerializer.Deserialize<PayPalWebhookEvent>(json, JsonOptions);
        if (payload is null || string.IsNullOrWhiteSpace(payload.Id))
            return false;

        if (await _paymentRepository.LogExistsForEventAsync(payload.Id, cancellationToken))
            return true;

        var isValid = await VerifySignatureAsync(payload, transmissionId, transmissionTime, transmissionSig, certUrl, authAlgo, cancellationToken);
        if (!isValid)
            return false;

        var log = new PaymentTransactionLog
        {
            Provider = "paypal",
            ExternalEventId = payload.Id,
            EventType = payload.EventType ?? "unknown",
            Payload = json,
            ProcessedOk = false,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await ApplyPaymentStateAsync(payload, cancellationToken);
            log.ProcessedOk = true;
        }
        catch (Exception ex)
        {
            log.ProcessedOk = false;
            log.ErrorMessage = ex.Message;
        }

        await _paymentRepository.AddLogAsync(log, cancellationToken);
        await _paymentRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task ApplyPaymentStateAsync(PayPalWebhookEvent evt, CancellationToken cancellationToken)
    {
        var candidateRefs = new[]
        {
            evt.Resource?.Id,
            evt.Resource?.SupplementaryData?.RelatedIds?.OrderId
        }.Where(x => !string.IsNullOrWhiteSpace(x)).Cast<string>().Distinct(StringComparer.Ordinal).ToArray();

        if (candidateRefs.Length == 0)
            return;

        Payment? payment = null;
        foreach (var externalReference in candidateRefs)
        {
            payment = await _paymentRepository.GetTrackedByExternalReferenceAsync(externalReference, cancellationToken);
            if (payment is not null)
                break;
        }

        if (payment is null)
            return;

        var isSuccess = string.Equals(evt.EventType, "CHECKOUT.ORDER.APPROVED", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(evt.EventType, "PAYMENT.CAPTURE.COMPLETED", StringComparison.OrdinalIgnoreCase);
        var isFailure = string.Equals(evt.EventType, "PAYMENT.CAPTURE.DENIED", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(evt.EventType, "CHECKOUT.ORDER.VOIDED", StringComparison.OrdinalIgnoreCase);

        if (isSuccess)
        {
            payment.PaymentStatus = "Paid";
            payment.PaidAt = DateTime.UtcNow;
        }
        else if (isFailure)
        {
            payment.PaymentStatus = "Failed";
        }
        else
        {
            return;
        }

        payment.ExternalReference = payment.ExternalReference ?? evt.Resource?.Id;
        await _paymentRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task<bool> VerifySignatureAsync(
        PayPalWebhookEvent evt,
        string transmissionId,
        string transmissionTime,
        string transmissionSig,
        string certUrl,
        string authAlgo,
        CancellationToken cancellationToken)
    {
        var accessToken = await GetAccessTokenAsync(cancellationToken);
        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/notifications/verify-webhook-signature");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Content = JsonContent.Create(new PayPalVerifySignatureRequest
        {
            TransmissionId = transmissionId,
            TransmissionTime = transmissionTime,
            TransmissionSig = transmissionSig,
            CertUrl = certUrl,
            AuthAlgo = authAlgo,
            WebhookId = _payPalOptions.WebhookId,
            WebhookEvent = evt
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return false;

        var result = await response.Content.ReadFromJsonAsync<PayPalVerifySignatureResponse>(cancellationToken: cancellationToken);
        return string.Equals(result?.VerificationStatus, "SUCCESS", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var basic = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{_payPalOptions.ClientId}:{_payPalOptions.ClientSecret}"));
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

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private sealed class PayPalTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;
    }

    private sealed class PayPalVerifySignatureRequest
    {
        [JsonPropertyName("transmission_id")]
        public string TransmissionId { get; set; } = string.Empty;

        [JsonPropertyName("transmission_time")]
        public string TransmissionTime { get; set; } = string.Empty;

        [JsonPropertyName("transmission_sig")]
        public string TransmissionSig { get; set; } = string.Empty;

        [JsonPropertyName("cert_url")]
        public string CertUrl { get; set; } = string.Empty;

        [JsonPropertyName("auth_algo")]
        public string AuthAlgo { get; set; } = string.Empty;

        [JsonPropertyName("webhook_id")]
        public string WebhookId { get; set; } = string.Empty;

        [JsonPropertyName("webhook_event")]
        public PayPalWebhookEvent WebhookEvent { get; set; } = new();
    }

    private sealed class PayPalVerifySignatureResponse
    {
        [JsonPropertyName("verification_status")]
        public string VerificationStatus { get; set; } = string.Empty;
    }

    private sealed class PayPalWebhookEvent
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("event_type")]
        public string? EventType { get; set; }

        [JsonPropertyName("resource")]
        public PayPalWebhookResource? Resource { get; set; }
    }

    private sealed class PayPalWebhookResource
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("supplementary_data")]
        public PayPalSupplementaryData? SupplementaryData { get; set; }
    }

    private sealed class PayPalSupplementaryData
    {
        [JsonPropertyName("related_ids")]
        public PayPalRelatedIds? RelatedIds { get; set; }
    }

    private sealed class PayPalRelatedIds
    {
        [JsonPropertyName("order_id")]
        public string? OrderId { get; set; }
    }
}
