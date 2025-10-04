using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Drobble.OrderManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPromotionsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AppliedPromoCode",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppliedPromoCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Orders");
        }
    }
}
