using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalWorkflowEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "advance_amount",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "fuel_responsibility_type",
                table: "rental_bookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "pickup_transport_charge",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "return_transport_charge",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "security_deposit_amount",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "site_address",
                table: "rental_bookings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "site_contact_number",
                table: "rental_bookings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "site_contact_person",
                table: "rental_bookings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "site_landmark",
                table: "rental_bookings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "site_name",
                table: "rental_bookings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "transport_notes",
                table: "rental_bookings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "advance_amount",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "fuel_responsibility_type",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "pickup_transport_charge",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "return_transport_charge",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "security_deposit_amount",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "site_address",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "site_contact_number",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "site_contact_person",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "site_landmark",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "site_name",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "transport_notes",
                table: "rental_bookings");
        }
    }
}
