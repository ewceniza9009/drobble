// ---- File: src/services/ReviewsRatings/Drobble.ReviewsRatings.Application/Features/Reviews/Commands/CreateReviewCommandHandler.cs ----
using Drobble.ReviewsRatings.Application.Contracts;
using Drobble.ReviewsRatings.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using System.Security.Claims;

namespace Drobble.ReviewsRatings.Application.Features.Reviews.Commands;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ObjectId>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IProductCatalogService _productCatalogService;

    public CreateReviewCommandHandler(IReviewRepository reviewRepository, IHttpContextAccessor httpContextAccessor, IProductCatalogService productCatalogService)
    {
        _reviewRepository = reviewRepository;
        _httpContextAccessor = httpContextAccessor;
        _productCatalogService = productCatalogService;
    }

    public async Task<ObjectId> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // Fetch product details to get the VendorId
        var product = await _productCatalogService.GetProductByIdAsync(request.ProductId, cancellationToken);
        if (product is null)
        {
            throw new Exception("Product not found, cannot create review.");
        }

        var review = new Review
        {
            ProductId = ObjectId.Parse(request.ProductId),
            UserId = userId,
            VendorId = product.VendorId, // Set the VendorId from the product details
            Rating = request.Rating,
            Comment = request.Comment,
            VerifiedPurchase = false, // This would be implemented by checking the Order service
            ModerationStatus = ModerationStatus.Pending
        };

        await _reviewRepository.AddAsync(review, cancellationToken);

        return review.Id;
    }
}
