using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public static class FeatureExtensions
{
    public static bool MatchesName(this Feature feature, string? value) => feature.MatchesProperty("name", value);
    public static bool MatchesRegion(this Feature feature, string? value) => feature.MatchesProperty("region", value);
    public static bool MatchesCountry(this Feature feature, string? value) => feature.MatchesProperty("country", value);

    public static bool MatchesProperty(this Feature feature, string propertyName, string? value)
    {
        if (value is null)
        {
            return true;
        }
        else if (feature.Properties.TryGetValue(propertyName, out object? nameElement))
        {
            return nameElement is JsonElement e &&
                e.ValueKind == JsonValueKind.String &&
                e.GetString()
                ?.Equals(value, StringComparison.InvariantCultureIgnoreCase) == true;
        }
        return false;
    }
}