using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class GetCustomAreas
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public GetCustomAreas(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<GetCustomAreas>();
        _serviceClient = serviceClient;
    }

    [Function("GetCustomAreas")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient areaBlob = container.GetBlobClient(Constants.CustomAreas);

        string json = await areaBlob.DownloadTextAsync();
        var areas = JsonSerializer.Deserialize<List<Feature>>(json);
        
        if (areas is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        FeatureCollection fcol = new()
        {
            Features = areas,
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
