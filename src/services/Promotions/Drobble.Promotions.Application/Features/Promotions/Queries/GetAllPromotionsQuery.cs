// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Queries/GetAllPromotionsQuery.cs ----
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Queries;

public record GetAllPromotionsQuery() : IRequest<IEnumerable<PromotionDto>>;