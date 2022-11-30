using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;

namespace GrafelgamFunctions;

public class GetAreas
{
    private readonly ILogger _logger;
    private readonly IFeatureLoader _featureLoader;

    public GetAreas(
        ILoggerFactory loggerFactory,
        IFeatureLoader featureLoader)
    {
        _logger = loggerFactory.CreateLogger<GetAreas>();
        _featureLoader = featureLoader;
    }

    [Function("GetAreas")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req,
        bool? custom,
        string? name)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var areas = await _featureLoader.LoadAreas();
        if (custom == true)
        {
            var customFeatures = await _featureLoader.LoadCustom();
            foreach (var c in customFeatures)
            {
                c.Properties["custom"] = true;
            }
            areas = areas
                .Concat(customFeatures.Where(f => f.Geometry is Polygon))
                .ToList();
        }

        FeatureCollection fcol = new()
        {
            Features = areas
                .Where(f => f.MatchesName(name))
                .ToList()
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
