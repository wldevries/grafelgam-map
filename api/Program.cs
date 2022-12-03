using GrafelgamFunctions;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
        services.AddTransient<IFeatureLoader, FeatureLoader>();
        services.AddAzureClients(azureBuilder =>
        {
            string mapStorage = ctx.Configuration.GetValue<string>("mapstorage");
            azureBuilder.AddBlobServiceClient(mapStorage);
            azureBuilder.AddTableServiceClient(mapStorage);
        });
    })
    .Build();

host.Run();
