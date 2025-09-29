using Drobble.SearchDiscovery.Domain;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.QueryDsl;
using MediatR;

namespace Drobble.SearchDiscovery.Application.Features;

public record SearchProductsQuery(string QueryText) : IRequest<IEnumerable<ProductDocument>>;

public class SearchProductsQueryHandler : IRequestHandler<SearchProductsQuery, IEnumerable<ProductDocument>>
{
    private readonly ElasticsearchClient _esClient;

    public SearchProductsQueryHandler(ElasticsearchClient esClient)
    {
        _esClient = esClient;
    }

    public async Task<IEnumerable<ProductDocument>> Handle(SearchProductsQuery request, CancellationToken cancellationToken)
    {
        var response = await _esClient.SearchAsync<ProductDocument>(s => s
            .Index("products")
            .Query(q => q
                .MultiMatch(mm => mm
                    .Query(request.QueryText)
                    .Fields("name,description")
                    // This query type is optimized for "search-as-you-type"
                    .Type(TextQueryType.BoolPrefix)
                )
            ), cancellationToken);

        return response.IsValidResponse ? response.Documents : Enumerable.Empty<ProductDocument>();
    }
}