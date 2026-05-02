using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRentalBookingDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "booking_date",
                table: "rental_bookings");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "rental_bookings",
                newName: "start_date_time");

            migrationBuilder.RenameColumn(
                name: "rental_rate",
                table: "rental_bookings",
                newName: "rate_amount");

            migrationBuilder.RenameColumn(
                name: "expected_end_date",
                table: "rental_bookings",
                newName: "expected_end_date_time");

            migrationBuilder.RenameColumn(
                name: "actual_end_date",
                table: "rental_bookings",
                newName: "actual_end_date_time");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "rental_bookings",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<decimal>(
                name: "end_odometer",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_invoiced",
                table: "rental_bookings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "start_odometer",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "total_amount",
                table: "rental_bookings",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_rental_bookings_status",
                table: "rental_bookings",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_rental_bookings_status",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "end_odometer",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "is_invoiced",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "start_odometer",
                table: "rental_bookings");

            migrationBuilder.DropColumn(
                name: "total_amount",
                table: "rental_bookings");

            migrationBuilder.RenameColumn(
                name: "start_date_time",
                table: "rental_bookings",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "rate_amount",
                table: "rental_bookings",
                newName: "rental_rate");

            migrationBuilder.RenameColumn(
                name: "expected_end_date_time",
                table: "rental_bookings",
                newName: "expected_end_date");

            migrationBuilder.RenameColumn(
                name: "actual_end_date_time",
                table: "rental_bookings",
                newName: "actual_end_date");

            migrationBuilder.AlterColumn<int>(
                name: "status",
                table: "rental_bookings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "booking_date",
                table: "rental_bookings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
