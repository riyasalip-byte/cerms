using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RedesignAssetVehicleEquipmentModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "name",
                table: "assets",
                newName: "asset_name");

            migrationBuilder.RenameColumn(
                name: "current_odometer",
                table: "assets",
                newName: "current_meter_reading");

            migrationBuilder.RenameColumn(
                name: "asset_type",
                table: "assets",
                newName: "asset_category");

            migrationBuilder.AlterColumn<DateTime>(
                name: "purchase_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "chasis_no",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "engine_no",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fitness_expiry_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "register_no",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE assets
                SET register_no = asset_code,
                    asset_category = CASE
                        WHEN asset_category IN ('Excavator', 'MiniExcavator', 'BackhoeLoader', 'LightMediumDutyTipper', 'HeavyDutyTipper')
                            THEN asset_category
                        ELSE 'Excavator'
                    END
                """);

            migrationBuilder.AlterColumn<string>(
                name: "register_no",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "insurance_company",
                table: "assets",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "insurance_expiry_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "insurance_no",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "make_year",
                table: "assets",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "model",
                table: "assets",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "place_of_registration",
                table: "assets",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "pucc_expiry_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "register_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_customers_name",
                table: "customers",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_customers_phone",
                table: "customers",
                column: "phone");

            migrationBuilder.CreateIndex(
                name: "ix_assets_insurance_no",
                table: "assets",
                column: "insurance_no");

            migrationBuilder.CreateIndex(
                name: "ix_assets_register_no",
                table: "assets",
                column: "register_no");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_customers_name",
                table: "customers");

            migrationBuilder.DropIndex(
                name: "ix_customers_phone",
                table: "customers");

            migrationBuilder.DropIndex(
                name: "ix_assets_register_no",
                table: "assets");

            migrationBuilder.DropIndex(
                name: "ix_assets_insurance_no",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "register_no",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "chasis_no",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "engine_no",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "fitness_expiry_date",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "insurance_company",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "insurance_expiry_date",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "insurance_no",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "make_year",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "model",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "place_of_registration",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "pucc_expiry_date",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "register_date",
                table: "assets");

            migrationBuilder.RenameColumn(
                name: "asset_category",
                table: "assets",
                newName: "asset_type");

            migrationBuilder.RenameColumn(
                name: "current_meter_reading",
                table: "assets",
                newName: "current_odometer");

            migrationBuilder.RenameColumn(
                name: "asset_name",
                table: "assets",
                newName: "name");

            migrationBuilder.AlterColumn<DateTime>(
                name: "purchase_date",
                table: "assets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }
    }
}
