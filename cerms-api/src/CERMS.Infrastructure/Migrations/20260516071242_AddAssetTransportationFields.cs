using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetTransportationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_transportation_required",
                table: "assets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "transportation_notes",
                table: "assets",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_transportation_required",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "transportation_notes",
                table: "assets");
        }
    }
}
