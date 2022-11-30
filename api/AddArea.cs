using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public class AddArea
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public AddArea(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<AddArea>();
        _serviceClient = serviceClient;
    }

    [Function("AddArea")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient placeBlob = container.GetBlobClient(Constants.CustomAreas);

        // Parse place to add
        Feature? areaToAdd;
        try
        {
            using StreamReader sr = new(req.Body);
            string json = await sr.ReadToEndAsync();
            areaToAdd = JsonSerializer.Deserialize<Feature>(json);

            if (areaToAdd == null)
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
        }
        catch (Exception)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        IList<Feature> areas;
        if (await placeBlob.ExistsAsync())
        {
            string blobJson = await placeBlob.DownloadTextAsync();
            areas = JsonSerializer.Deserialize<IList<Feature>>(blobJson) ?? Array.Empty<Feature>();
        }
        else
        {
            areas = Array.Empty<Feature>();
        }

        areas = areas.Where(p => p.Id != areaToAdd.Id).ToList();
        areas.Add(areaToAdd);

        string placesJson = JsonSerializer.Serialize(areas);
        using var writeStream = await placeBlob.OpenWriteAsync(overwrite: true);
        using var sw = new StreamWriter(writeStream);
        sw.Write(placesJson);

        return req.CreateResponse(HttpStatusCode.OK);
    }
}
