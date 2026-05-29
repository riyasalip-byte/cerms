using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOperatorAndAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "operators",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    operator_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    mobile_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    alternate_mobile_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    license_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    license_expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    joining_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    daily_wage = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_operators", x => x.id);
                    table.ForeignKey(
                        name: "fk_operators_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "rental_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    rental_id = table.Column<Guid>(type: "uuid", nullable: false),
                    operator_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    assigned_by = table.Column<Guid>(type: "uuid", nullable: true),
                    assignment_status = table.Column<int>(type: "integer", nullable: false),
                    actual_start_date_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_end_date_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    start_meter_reading = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    end_meter_reading = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    start_remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    completion_remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_invoice_generated = table.Column<bool>(type: "boolean", nullable: false),
                    invoice_generated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rental_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_rental_assignments_operators_operator_id",
                        column: x => x.operator_id,
                        principalTable: "operators",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_rental_assignments_rental_bookings_rental_id",
                        column: x => x.rental_id,
                        principalTable: "rental_bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_operators_operator_code",
                table: "operators",
                column: "operator_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_operators_user_id",
                table: "operators",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_rental_assignments_operator_id",
                table: "rental_assignments",
                column: "operator_id");

            migrationBuilder.CreateIndex(
                name: "ix_rental_assignments_rental_id",
                table: "rental_assignments",
                column: "rental_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rental_assignments");

            migrationBuilder.DropTable(
                name: "operators");
        }
    }
}
