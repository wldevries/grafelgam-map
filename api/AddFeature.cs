using Azure.Data.Tables;
using GeoJSON.Text.Feature;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GrafelgamFunctions;

public class AddFeature
{
    private readonly ILogger _logger;
    private readonly TableServiceClient _serviceClient;

    public AddFeature(
        ILoggerFactory loggerFactory,
        TableServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<AddFeature>();
        _serviceClient = serviceClient;
    }

    [Function("AddFeature")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        TableClient? client = _serviceClient.GetTableClient(Constants.FeaturesTable);

        // Parse feature to add
        AddFeatureRequest? featureToAdd;
        try
        {
            using StreamReader sr = new(req.Body);
            string json = await sr.ReadToEndAsync();
            featureToAdd = JsonSerializer.Deserialize<AddFeatureRequest>(json);

            if (featureToAdd == null)
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
        }
        catch (Exception)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        TableEntity tableEntity = featureToAdd.Feature.ToTableEntity();
        // Overwrite any column
        tableEntity.ETag = new Azure.ETag("*");
        tableEntity["sub"] = featureToAdd.Sub;
        tableEntity["email"] = featureToAdd.Email;
        await client.UpsertEntityAsync(tableEntity);

        return req.CreateResponse(HttpStatusCode.OK);
    }

    public class AddFeatureRequest
    {
        [JsonPropertyName("feature")]
        public Feature Feature { get; set; }
        [JsonPropertyName("sub")]
        public string Sub { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
    }
}
