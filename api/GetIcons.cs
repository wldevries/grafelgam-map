using Microsoft.Extensions.Configuration;

namespace GrafelgamFunctions;

public class GetIcons
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;
    private readonly string _baseAddress;

    public GetIcons(
        ILoggerFactory loggerFactory,
        IConfiguration configuration,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<GetIcons>();
        _baseAddress = configuration["static_uri"] ?? throw new ArgumentException("Base address not set");
        _serviceClient = serviceClient;
    }

    [Function("GetIcons")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);

        List<BlobItem> blobs = await container.ListBlobsAsync("icons");

        HttpResponseData response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new
        {
            status = "success",
            data = blobs.Select(b => new 
            {
                name = b.Name["icons/".Length..],
                url = _baseAddress + b.Name,
            }),
        });

        _logger.LogInformation("Returned {count} icons on {address}", blobs.Count, _baseAddress);

        return response;
    }
}

