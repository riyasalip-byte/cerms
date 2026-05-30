using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJointEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_role_permissions",
                table: "role_permissions");

            migrationBuilder.AddColumn<Guid>(
                name: "id",
                table: "user_roles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "branch_id",
                table: "user_roles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "company_id",
                table: "user_roles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "user_roles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "user_roles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "user_roles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "id",
                table: "role_permissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "branch_id",
                table: "role_permissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "company_id",
                table: "role_permissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "role_permissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "role_permissions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "role_permissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_role_permissions",
                table: "role_permissions",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "ix_user_roles_user_id_role_id",
                table: "user_roles",
                columns: new[] { "user_id", "role_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_role_permissions_role_id_permission_id",
                table: "role_permissions",
                columns: new[] { "role_id", "permission_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles");

            migrationBuilder.DropIndex(
                name: "ix_user_roles_user_id_role_id",
                table: "user_roles");

            migrationBuilder.DropPrimaryKey(
                name: "pk_role_permissions",
                table: "role_permissions");

            migrationBuilder.DropIndex(
                name: "ix_role_permissions_role_id_permission_id",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "id",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "company_id",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "id",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "company_id",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "role_permissions");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_roles",
                table: "user_roles",
                columns: new[] { "user_id", "role_id" });

            migrationBuilder.AddPrimaryKey(
                name: "pk_role_permissions",
                table: "role_permissions",
                columns: new[] { "role_id", "permission_id" });
        }
    }
}
