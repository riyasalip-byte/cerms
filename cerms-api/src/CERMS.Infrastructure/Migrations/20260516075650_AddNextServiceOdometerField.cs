using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNextServiceOdometerField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "next_service_odometer",
                table: "maintenance_records",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "next_service_odometer",
                table: "assets",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "next_service_odometer",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "next_service_odometer",
                table: "assets");
        }
    }
}
