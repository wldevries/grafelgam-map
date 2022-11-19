using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Reflection;

var host = new HostBuilder()
    .ConfigureAppConfiguration(b => b
        //.SetBasePath(Environment.CurrentDirectory)
        //.AddJsonFile("AppSettings.json")
        .AddUserSecrets(Assembly.GetExecutingAssembly())
        .AddEnvironmentVariables())
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((ctx, services) =>
    {
        services.AddAzureClients(azureBuilder =>
        {
            azureBuilder.AddBlobServiceClient(ctx.Configuration.GetValue<string>("mapstorage"));
        });
    })
    .Build();

host.Run();
