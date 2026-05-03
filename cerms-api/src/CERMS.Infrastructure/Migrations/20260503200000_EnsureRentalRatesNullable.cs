using CERMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(CermsDbContext))]
    [Migration("20260503200000_EnsureRentalRatesNullable")]
    public partial class EnsureRentalRatesNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE rental_bookings ALTER COLUMN rate_type DROP NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE rental_bookings ALTER COLUMN rate_amount DROP NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE rental_bookings ALTER COLUMN rate_type SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE rental_bookings ALTER COLUMN rate_amount SET NOT NULL;");
        }
    }
}
