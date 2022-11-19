using Microsoft.Extensions.Configuration;

namespace GrafelgamFunctions;

public class GetBaseAddress
{
    private readonly ILogger _logger;
    private readonly string _baseAddress;

    public GetBaseAddress(
        ILoggerFactory loggerFactory,
        IConfiguration configuration)
    {
        _logger = loggerFactory.CreateLogger<GetIcons>();
        _baseAddress = configuration["static_uri"] ?? throw new ArgumentException("Base address not set");
    }

    [Function("GetBaseAddress")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        HttpResponseData response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new
        {
            status = "success",
            data = _baseAddress,
        });
        return response;
    }
}

