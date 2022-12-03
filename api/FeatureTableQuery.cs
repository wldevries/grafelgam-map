using Azure;
using Azure.Data.Tables;
using GeoJSON.Text.Feature;
using GeoJSON.Text.Geometry;
using System.Text.Json;

namespace GrafelgamFunctions
{
    public static class FeatureTableQuery
    {
        public static async IAsyncEnumerable<TableEntity> QueryAsync(TableClient client, string? filter = null)
        {
            var pageable = client.QueryAsync<TableEntity>(filter);

            await foreach (Page<TableEntity> page in pageable.AsPages())
            {
                foreach (var item in page.Values)
                {
                    yield return item;
                }
            }
        }

        public static Feature ToFeature(this TableEntity entity)
        {
            string id = entity.GetString("RowKey");
            string geojson = entity.GetString("geometry");
            IGeometryObject? geometry = JsonSerializer.Deserialize<IGeometryObject>(geojson);

            Feature feature = new(geometry, new Dictionary<string, object>(), id);

            foreach (var prop in entity)
            {
                if (prop.Key is not "geometry" and not "odata.etag" and not "PartitionKey" and not "RowKey")
                {
                    if (prop.Value is string s && !string.IsNullOrEmpty(s) || prop.Value is not string)
                    {
                        feature.Properties.Add(prop.Key, prop.Value);
                    }
                }
            }

            return feature;
        }

        public static TableEntity ToTableEntity(this Feature feature)
        {
            TableEntity e = new(feature.Geometry.Type.ToString(), feature.Id)
            {
                { "custom", true },
            };

            foreach (var property in feature.Properties)
            {
                e[property.Key] = property.Value;
            }

            string geometryJson = JsonSerializer.Serialize(feature.Geometry);
            e["geometry"] = geometryJson;
            e["type"] = feature.Geometry.Type.ToString();

            return e;
        }
    }
}
