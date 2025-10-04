// ---- File: src/services/Promotions/Drobble.Promotions.Application/Features/Promotions/Queries/ValidatePromoCodeQuery.cs ----
using MediatR;

namespace Drobble.Promotions.Application.Features.Promotions.Queries;

public record CartContext(
    decimal TotalAmount,
    List<string> ProductIds,
    List<string> CategoryIds);

public record ValidatePromoCodeQuery(
    string Code,
    CartContext Context) : IRequest<ValidationResponse>;

public record ValidationResponse(
    bool IsValid,
    decimal DiscountAmount,
    string Message);