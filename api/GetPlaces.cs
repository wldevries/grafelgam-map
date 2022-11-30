using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;

namespace GrafelgamFunctions;

public class GetPlaces
{
    private readonly ILogger _logger;
    private readonly IFeatureLoader _featureLoader;

    public GetPlaces(
        ILoggerFactory loggerFactory,
        IFeatureLoader featureLoader)
    {
        _logger = loggerFactory.CreateLogger<GetPlaces>();
        _featureLoader = featureLoader;
    }

    [Function("GetPlaces")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req,
        bool? custom,
        string? name,
        string? country,
        string? region)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var places = await _featureLoader.LoadPlaces();

        if (custom == true)
        {
            var customFeatures = await _featureLoader.LoadCustom();
            foreach (var c in customFeatures)
            {
                c.Properties["custom"] = true;
            }
            places = places
                .Concat(customFeatures.Where(f => f.Geometry is Point))
                .ToList();
        }

        FeatureCollection fcol = new()
        {
            Features = places
                .Where(f => f.MatchesName(name))
                .Where(f => f.MatchesRegion(region))
                .Where(f => f.MatchesCountry(country))
                .ToList(),
        };

        HttpResponseData response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new 
        {
            status = "success",
            data = fcol 
        });

        return response;
    }
}
