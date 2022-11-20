using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class GetAreas
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public GetAreas(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<GetAreas>();
        _serviceClient = serviceClient;
    }

    [Function("GetAreas")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req,
        string? name)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient("$web");
        BlobClient areaBlob = container.GetBlobClient("areas2.json");

        string json = await areaBlob.DownloadTextAsync();
        var areas = JsonSerializer.Deserialize<List<Feature>>(json);
        
        if (areas is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        FeatureCollection fcol = new()
        {
            Features = areas
                .Where(f => f.MatchesName(name))
                .ToList()
        };

        HttpResponseData response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(fcol);
        return response;
    }
}
