using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetCategoryMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "asset_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_transportation_required_by_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_categories", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "asset_categories",
                columns: new[] { "id", "name", "description", "is_transportation_required_by_default", "is_active", "company_id", "branch_id", "created_at", "updated_at", "is_deleted" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000101"), "Excavator", null, true, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000102"), "Mini Excavator", null, true, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000103"), "Backhoe Loader", null, true, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000104"), "Light/Medium Duty Tipper", null, false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false },
                    { new Guid("00000000-0000-0000-0000-000000000105"), "Heavy Duty Tipper", null, false, true, new Guid("00000000-0000-0000-0000-000000000001"), new Guid("00000000-0000-0000-0000-000000000001"), DateTime.UtcNow, null, false }
                });

            migrationBuilder.AddColumn<Guid>(
                name: "asset_category_id",
                table: "assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE assets
                SET asset_category_id = CASE
                    WHEN asset_category IN ('MiniExcavator', 'Mini Excavator') THEN '00000000-0000-0000-0000-000000000102'::uuid
                    WHEN asset_category IN ('BackhoeLoader', 'Backhoe Loader') THEN '00000000-0000-0000-0000-000000000103'::uuid
                    WHEN asset_category IN ('LightMediumDutyTipper', 'Light Medium Duty Tipper', 'Light/Medium Duty Tipper', 'Light / Medium Duty Tipper') THEN '00000000-0000-0000-0000-000000000104'::uuid
                    WHEN asset_category IN ('HeavyDutyTipper', 'Heavy Duty Tipper') THEN '00000000-0000-0000-0000-000000000105'::uuid
                    ELSE '00000000-0000-0000-0000-000000000101'::uuid
                END
                WHERE asset_category_id IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "asset_category_id",
                table: "assets",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "asset_category",
                table: "assets");

            migrationBuilder.CreateIndex(
                name: "ix_assets_asset_category_id",
                table: "assets",
                column: "asset_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_categories_name",
                table: "asset_categories",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_assets_asset_categories_asset_category_id",
                table: "assets",
                column: "asset_category_id",
                principalTable: "asset_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_assets_asset_categories_asset_category_id",
                table: "assets");

            migrationBuilder.DropIndex(
                name: "ix_assets_asset_category_id",
                table: "assets");

            migrationBuilder.AddColumn<string>(
                name: "asset_category",
                table: "assets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE assets
                SET asset_category = COALESCE(
                    CASE asset_categories.name
                        WHEN 'Mini Excavator' THEN 'MiniExcavator'
                        WHEN 'Backhoe Loader' THEN 'BackhoeLoader'
                        WHEN 'Light/Medium Duty Tipper' THEN 'LightMediumDutyTipper'
                        WHEN 'Heavy Duty Tipper' THEN 'HeavyDutyTipper'
                        ELSE 'Excavator'
                    END,
                    'Excavator')
                FROM asset_categories
                WHERE assets.asset_category_id = asset_categories.id;
                """);

            migrationBuilder.DropColumn(
                name: "asset_category_id",
                table: "assets");

            migrationBuilder.DropTable(
                name: "asset_categories");
        }
    }
}
