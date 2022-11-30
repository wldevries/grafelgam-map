using HttpMultipartParser;

namespace GrafelgamFunctions;

public class PostIcon
{
    private readonly ILogger _logger;
    private readonly BlobServiceClient _serviceClient;

    public PostIcon(
        ILoggerFactory loggerFactory,
        BlobServiceClient serviceClient)
    {
        _logger = loggerFactory.CreateLogger<PostIcon>();
        _serviceClient = serviceClient;
    }

    [Function("PostIcon")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var parser = await MultipartFormDataParser.ParseAsync(req.Body);

        // custom name, should we store it or use it for filename?
        //var icon = parser.GetParameterValue("icon");

        var file = parser.Files[0];

        if (file.Data.Length > 1_000_000)
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(new
            {
                status = "fail",
                message = $"Image is too large"
            });
            return response;
        }

        string filename = file.FileName;
        string extension = Path.GetExtension(filename).ToLowerInvariant();
        string? mime = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => null,
        };

        if (mime is null)
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(new
            {
                status = "fail",
                message = $"Image format {extension} not supported"
            });
            return response;
        }

        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient blob = container.GetBlobClient($"icons/{filename}");

        if (await blob.ExistsAsync())
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(new
            {
                status = "fail",
                message = $"Icon {filename} already exists"
            });
            return response;
        }
        else
        {
            await blob.UploadAsync(file.Data, CreateHeaders(mime));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                status = "success",
                message = $"Icon {filename} accpted",
            });
            return response;
        }
    }

    private static BlobHttpHeaders CreateHeaders(string mime)
    {
        return new BlobHttpHeaders
        {
            ContentType = mime,
        };
    }
}

