using Azure.Data.Tables;
using GeoJSON.Text.Feature;

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
            await foreach(var e in FeatureTableQuery.QueryAsync(client))
            {
                features.Add(e.ToFeature());
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
}
