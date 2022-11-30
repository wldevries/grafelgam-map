using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;

namespace GrafelgamFunctions;

public class GetFeatures
{
    private readonly ILogger _logger;
    private readonly IFeatureLoader _featureLoader;

    public GetFeatures(
        ILoggerFactory loggerFactory,
        IFeatureLoader featureLoader)
    {
        _logger = loggerFactory.CreateLogger<GetFeatures>();
        _featureLoader = featureLoader;
    }

    [Function("GetFeatures")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var customFeatures = await _featureLoader.LoadCustom();
        foreach (var c in customFeatures)
        {
            c.Properties["custom"] = true;
        }
        
        FeatureCollection fcol = new()
        {
            Features = customFeatures,
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
