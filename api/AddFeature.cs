using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class AddFeature
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public AddFeature(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<AddFeature>();
        _serviceClient = serviceClient;
    }

    [Function("AddFeature")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient placeBlob = container.GetBlobClient(Constants.CustomFeatures);

        // Parse feature to add
        Feature? featureToAdd;
        try
        {
            using StreamReader sr = new(req.Body);
            string json = await sr.ReadToEndAsync();
            featureToAdd = JsonSerializer.Deserialize<Feature>(json);

            if (featureToAdd == null)
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
        }
        catch (Exception)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        IList<Feature> places;
        if (await placeBlob.ExistsAsync())
        {
            string blobJson = await placeBlob.DownloadTextAsync();
            places = JsonSerializer.Deserialize<IList<Feature>>(blobJson) ?? Array.Empty<Feature>();
        }
        else
        {
            places = Array.Empty<Feature>();
        }

        places = places.Where(p => p.Id != featureToAdd.Id).ToList();
        places.Add(featureToAdd);

        string placesJson = JsonSerializer.Serialize(places);
        using var writeStream = await placeBlob.OpenWriteAsync(overwrite: true);
        using var sw = new StreamWriter(writeStream);
        sw.Write(placesJson);

        return req.CreateResponse(HttpStatusCode.OK);
    }
}

