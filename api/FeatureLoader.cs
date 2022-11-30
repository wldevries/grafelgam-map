using GeoJSON.Text.Feature;
using System.Text.Json;

namespace GrafelgamFunctions;

public interface IFeatureLoader
{
    Task<List<Feature>> LoadAreas();
    Task<List<Feature>> LoadPlaces();
    Task<List<Feature>> LoadCustom();
}

public class FeatureLoader : IFeatureLoader
{
    private readonly BlobServiceClient _serviceClient;

    public FeatureLoader(
        BlobServiceClient serviceClient)
    {
        _serviceClient = serviceClient;
    }

    public async Task<List<Feature>> LoadPlaces() => await LoadFeatures(Constants.Locations);
    public async Task<List<Feature>> LoadAreas() => await LoadFeatures(Constants.Areas);
    public async Task<List<Feature>> LoadCustom() => await LoadFeatures(Constants.CustomFeatures);

    private async Task<List<Feature>> LoadFeatures(string blobPath)
    {
        BlobContainerClient container = _serviceClient.GetBlobContainerClient(Constants.WebContainer);
        BlobClient placeBlob = container.GetBlobClient(blobPath);

        if (await placeBlob.ExistsAsync())
        {
            string json = await placeBlob.DownloadTextAsync();
            return JsonSerializer.Deserialize<List<Feature>>(json) ?? new List<Feature>();
        }
        else
        {
            return new List<Feature>();
        }
    }
}
