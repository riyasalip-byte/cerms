using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RedesignCustomerModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_customers_email",
                table: "customers");

            migrationBuilder.RenameColumn(
                name: "phone",
                table: "customers",
                newName: "mobile_no");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "customers",
                newName: "customer_name");

            migrationBuilder.RenameColumn(
                name: "id_proof_number",
                table: "customers",
                newName: "state");

            migrationBuilder.RenameColumn(
                name: "company_name",
                table: "customers",
                newName: "contact_person_name");

            migrationBuilder.RenameIndex(
                name: "ix_customers_phone",
                table: "customers",
                newName: "ix_customers_mobile_no");

            migrationBuilder.RenameIndex(
                name: "ix_customers_name",
                table: "customers",
                newName: "ix_customers_customer_name");

            migrationBuilder.AddColumn<string>(
                name: "alternate_mobile_no",
                table: "customers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "contact_person_address",
                table: "customers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "contact_person_mobile_no",
                table: "customers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "credit_limit",
                table: "customers",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "customer_type",
                table: "customers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "gst_or_tax_number",
                table: "customers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "customers",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "outstanding_balance",
                table: "customers",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "pincode",
                table: "customers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "whats_app_no",
                table: "customers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "alternate_mobile_no",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "city",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "contact_person_address",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "contact_person_mobile_no",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "credit_limit",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "customer_type",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "gst_or_tax_number",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "outstanding_balance",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "pincode",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "whats_app_no",
                table: "customers");

            migrationBuilder.RenameColumn(
                name: "state",
                table: "customers",
                newName: "id_proof_number");

            migrationBuilder.RenameColumn(
                name: "mobile_no",
                table: "customers",
                newName: "phone");

            migrationBuilder.RenameColumn(
                name: "customer_name",
                table: "customers",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "contact_person_name",
                table: "customers",
                newName: "company_name");

            migrationBuilder.RenameIndex(
                name: "ix_customers_mobile_no",
                table: "customers",
                newName: "ix_customers_phone");

            migrationBuilder.RenameIndex(
                name: "ix_customers_customer_name",
                table: "customers",
                newName: "ix_customers_name");

            migrationBuilder.CreateIndex(
                name: "ix_customers_email",
                table: "customers",
                column: "email",
                unique: true);
        }
    }
}
