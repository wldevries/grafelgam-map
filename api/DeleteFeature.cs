using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class DeleteFeature
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public DeleteFeature(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<DeleteFeature>();
        _serviceClient = serviceClient;
    }

    [Function("DeleteFeature")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
        string featureId)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient placeBlob = container.GetBlobClient(Constants.CustomFeatures);

        List<Feature> features;
        if (await placeBlob.ExistsAsync())
        {
            string blobJson = await placeBlob.DownloadTextAsync();
            features = JsonSerializer.Deserialize<List<Feature>>(blobJson) ?? new List<Feature>();
        }
        else
        {
            features = new List<Feature>();
        }

        int index = features.FindIndex(f => f.Id == featureId);
        if (index == -1)
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }
        else
        {
            features.RemoveAt(index);

            string featureJson = JsonSerializer.Serialize(features);
            using var writeStream = await placeBlob.OpenWriteAsync(overwrite: true);
            using var sw = new StreamWriter(writeStream);
            sw.Write(featureJson);

            return req.CreateResponse(HttpStatusCode.OK);
        }
    }
}
