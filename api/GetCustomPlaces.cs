using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class GetCustomPlaces
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public GetCustomPlaces(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<GetCustomPlaces>();
        _serviceClient = serviceClient;
    }

    [Function("GetCustomPlaces")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient("$web");
        BlobClient placeBlob = container.GetBlobClient("customLocations.json");

        string json = await placeBlob.DownloadTextAsync();
        var places = JsonSerializer.Deserialize<List<Feature>>(json);

        if (places is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        FeatureCollection fcol = new()
        {
            Features = places,
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

