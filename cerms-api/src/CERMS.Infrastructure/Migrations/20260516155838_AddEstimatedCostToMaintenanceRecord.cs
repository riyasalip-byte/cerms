using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimatedCostToMaintenanceRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "estimated_cost",
                table: "maintenance_records",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "estimated_cost",
                table: "maintenance_records");
        }
    }
}
