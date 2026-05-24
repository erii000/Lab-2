using System.Text;
using System.Text.Json;
using ClosedXML.Excel;

namespace TravelAssistant.Common.Export;

public static class TabularExport
{
    public static byte[] ToJsonUtf8<T>(IEnumerable<T> rows) =>
        JsonSerializer.SerializeToUtf8Bytes(
            rows.ToList(),
            new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

    public static byte[] ToCsv(IReadOnlyList<string> headers, IReadOnlyList<IReadOnlyList<string>> dataRows)
    {
        var sb = new StringBuilder();
        sb.AppendLine(string.Join(',', headers.Select(EscapeCsvField)));
        foreach (var row in dataRows)
            sb.AppendLine(string.Join(',', row.Select(EscapeCsvField)));
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    public static byte[] ToXlsx(string sheetName, IReadOnlyList<string> headers, IReadOnlyList<IReadOnlyList<string>> dataRows)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add(sheetName);
        for (var c = 0; c < headers.Count; c++)
            sheet.Cell(1, c + 1).Value = headers[c];
        for (var r = 0; r < dataRows.Count; r++)
        {
            for (var c = 0; c < dataRows[r].Count; c++)
                sheet.Cell(r + 2, c + 1).Value = dataRows[r][c];
        }

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    private static string EscapeCsvField(string value)
    {
        if (value.Contains('"') || value.Contains(',') || value.Contains('\n') || value.Contains('\r'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
