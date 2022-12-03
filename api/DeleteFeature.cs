using Azure.Data.Tables;

namespace GrafelgamFunctions;

public class DeleteFeature
{
    private readonly ILogger _logger;
    private readonly TableServiceClient _serviceClient;

    public DeleteFeature(
        ILoggerFactory loggerFactory,
        TableServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<DeleteFeature>();
        _serviceClient = serviceClient;
    }

    [Function("DeleteFeature")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
        string featureId, string sub)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        TableClient? client = _serviceClient.GetTableClient(Constants.FeaturesTable);

        // We need the RowKey and PartitionKey to delete:
        // The PartitionKey is set 'sub', the Google ID of the user
        string partitionKey = sub;
        // The id of features is stored in RowKey
        string rowKey = featureId;

        Azure.Response<TableEntity> tableResponse = await client.GetEntityAsync<TableEntity>(partitionKey, rowKey);
        if (tableResponse.Value is TableEntity entity)
        {
            if (entity.GetBoolean("custom") == true)
            {
                await client.DeleteEntityAsync(partitionKey, rowKey);
                return req.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                // Cannot delete features that are not custom
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
        }
        else
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
    }
}
