using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class GetPlaces
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public GetPlaces(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<GetPlaces>();
        _serviceClient = serviceClient;
    }

    [Function("GetPlaces")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req,
        string? name,
        string? country,
        string? region)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient("$web");
        BlobClient placeBlob = container.GetBlobClient("locations2.json");

        string json = await placeBlob.DownloadTextAsync();
        var places = JsonSerializer.Deserialize<List<Feature>>(json);

        if (places is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
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

