using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceMaintenanceRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "completed_at",
                table: "maintenance_records",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "final_cost",
                table: "maintenance_records",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "maintenance_records",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "completed_at",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "final_cost",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "status",
                table: "maintenance_records");
        }
    }
}
