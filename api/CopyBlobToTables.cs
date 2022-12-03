using Azure.Data.Tables;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using System.Text.Json;

namespace GrafelgamFunctions;

public class CopyBlobToTable
{
    private readonly ILogger _logger;
    private readonly TableServiceClient _tableServiceClient;
    private readonly IFeatureLoader _featureLoader;

    public CopyBlobToTable(
        ILoggerFactory loggerFactory,
        TableServiceClient tableServiceClient,
        IFeatureLoader featureLoader)
    {
        _logger = loggerFactory.CreateLogger<CopyBlobToTable>();
        _tableServiceClient = tableServiceClient;
        _featureLoader = featureLoader;
    }

    [Function("CopyBlobToTable")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var custom = await _featureLoader.LoadCustom();
        var places = await _featureLoader.LoadPlaces();
        var areas = await _featureLoader.LoadAreas();


        var features = custom.Concat(places).Concat(areas);
        foreach (var c in features)
        {
            c.Properties["custom"] = custom.Contains(c);
        }

        await _tableServiceClient.CreateTableIfNotExistsAsync(Constants.FeaturesTable);

        var client = _tableServiceClient.GetTableClient(Constants.FeaturesTable);

        foreach (Feature f in features)
        {
            TableEntity e = new(f.Geometry.Type.ToString(), f.Id)
            {
                { "custom", true },
            };

            foreach (var property in f.Properties)
            {
                e[property.Key] = property.Value;
            }

            string geometryJson = JsonSerializer.Serialize(f.Geometry);
            e["geometry"] = geometryJson;
            e["type"] = f.Geometry.Type.ToString();

            await client.UpdateEntityAsync(e, new Azure.ETag("*"));
        }

        return req.CreateResponse(HttpStatusCode.OK);
    }
}
