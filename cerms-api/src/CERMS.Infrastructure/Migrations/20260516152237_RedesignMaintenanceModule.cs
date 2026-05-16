using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RedesignMaintenanceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "final_cost",
                table: "maintenance_records");

            migrationBuilder.RenameColumn(
                name: "odometer",
                table: "maintenance_records",
                newName: "odo_meter_reading");

            migrationBuilder.RenameColumn(
                name: "next_service_odometer",
                table: "maintenance_records",
                newName: "next_service_odo_meter_reading");

            migrationBuilder.RenameColumn(
                name: "next_service_due_date",
                table: "maintenance_records",
                newName: "next_service_date");

            migrationBuilder.RenameColumn(
                name: "cost",
                table: "maintenance_records",
                newName: "total_cost");

            migrationBuilder.AddColumn<decimal>(
                name: "spare_parts_cost",
                table: "maintenance_records",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "labour_cost",
                table: "maintenance_records",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "maintenance_type_id",
                table: "maintenance_records",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000201"));

            migrationBuilder.AddColumn<string>(
                name: "service_remarks",
                table: "maintenance_records",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "service_vendor",
                table: "maintenance_records",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "maintenance_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_preventive_maintenance = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maintenance_types", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "maintenance_types",
                columns: new[] { "id", "name", "description", "is_preventive_maintenance", "is_active", "company_id", "branch_id", "created_at", "updated_at", "is_deleted" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000201"), "Preventive Maintenance", "Scheduled preventive maintenance.", true, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000202"), "Breakdown Maintenance", "Unplanned maintenance after failure.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000203"), "Periodic Service", "Routine periodic service.", true, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000204"), "Major Repair", "Major repair work.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000205"), "Tyre Replacement", "Tyre replacement or repair.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000206"), "Hydraulic Work", "Hydraulic system work.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000207"), "Electrical Work", "Electrical system work.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000208"), "Engine Work", "Engine diagnostics or repair.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000209"), "Accident Repair", "Accident repair work.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000210"), "Other", "Other maintenance activity.", false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false }
                });

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_records_maintenance_type_id",
                table: "maintenance_records",
                column: "maintenance_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_types_name",
                table: "maintenance_types",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_maintenance_records_maintenance_types_maintenance_type_id",
                table: "maintenance_records",
                column: "maintenance_type_id",
                principalTable: "maintenance_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_maintenance_records_maintenance_types_maintenance_type_id",
                table: "maintenance_records");

            migrationBuilder.DropTable(
                name: "maintenance_types");

            migrationBuilder.DropIndex(
                name: "ix_maintenance_records_maintenance_type_id",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "labour_cost",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "maintenance_type_id",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "spare_parts_cost",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "service_remarks",
                table: "maintenance_records");

            migrationBuilder.DropColumn(
                name: "service_vendor",
                table: "maintenance_records");

            migrationBuilder.RenameColumn(
                name: "odo_meter_reading",
                table: "maintenance_records",
                newName: "odometer");

            migrationBuilder.RenameColumn(
                name: "total_cost",
                table: "maintenance_records",
                newName: "cost");

            migrationBuilder.RenameColumn(
                name: "next_service_odo_meter_reading",
                table: "maintenance_records",
                newName: "next_service_odometer");

            migrationBuilder.RenameColumn(
                name: "next_service_date",
                table: "maintenance_records",
                newName: "next_service_due_date");

            migrationBuilder.AddColumn<decimal>(
                name: "final_cost",
                table: "maintenance_records",
                type: "numeric",
                nullable: true);
        }
    }
}
