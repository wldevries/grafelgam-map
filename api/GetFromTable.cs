using Azure;
using Azure.Data.Tables;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using System.Text.Json;

namespace GrafelgamFunctions;

public class GetFeatures
{
    private readonly ILogger _logger;
    private readonly TableServiceClient _tableServiceClient;

    public GetFeatures(
        ILoggerFactory loggerFactory,
        TableServiceClient tableServiceClient)
    {
        _logger = loggerFactory.CreateLogger<GetFeatures>();
        _tableServiceClient = tableServiceClient;
    }

    [Function("GetFeatures")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        TableClient? client = _tableServiceClient.GetTableClient(Constants.FeaturesTable);

        if (client is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        else
        {
            List<Feature> features = new();
            await foreach(var f in LoadFeatures(client))
            {
                features.Add(f);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                status = "success",
                data = new FeatureCollection(features),
            });
            return response;
        }
    }

    private static async IAsyncEnumerable<Feature> LoadFeatures(TableClient client, string? filter = null)
    {
        var pageable = client.QueryAsync<TableEntity>(filter);

        await foreach (Page<TableEntity> page in pageable.AsPages())
        {
            foreach (var item in page.Values)
            {
                string id = item.GetString("RowKey");
                string geojson = item.GetString("geometry");
                IGeometryObject? geometry = JsonSerializer.Deserialize<IGeometryObject>(geojson);

                Feature f = new(geometry, new Dictionary<string, object>(), id);

                foreach (var prop in item)
                {
                    if (prop.Key is not "geometry" and not "odata.etag" and not "PartitionKey" and not "RowKey")
                    {
                        if (prop.Value is string s && !string.IsNullOrEmpty(s) || prop.Value is not string)
                        {
                            f.Properties.Add(prop.Key, prop.Value);
                        }
                    }
                }

                yield return f;
            }
        }
    }
}
