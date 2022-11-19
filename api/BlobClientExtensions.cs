namespace GrafelgamFunctions
{
    public static class BlobClientExtensions
    {
        public static async Task<string> DownloadTextAsync(this BlobClient blobClient)
        {
            BlobDownloadResult downloadResult = await blobClient.DownloadContentAsync();
            return downloadResult.Content.ToString();
        }


        public static async Task<List<BlobItem>> ListBlobsAsync(this BlobContainerClient container, string? prefix = null)
        {
            List<BlobItem> result = new();
            var resultSegment = container.GetBlobsAsync(prefix: prefix).AsPages();
            await foreach (Azure.Page<BlobItem> blobPage in resultSegment)
            {
                // TODO: check if something is a directory
                result.AddRange(blobPage.Values);
            }
            return result;
        }
    }
}

