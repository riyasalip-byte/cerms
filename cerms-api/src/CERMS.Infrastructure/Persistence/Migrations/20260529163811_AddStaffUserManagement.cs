using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CERMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffUserManagement : Migration
    {
        private const string DefaultCompanyId = "00000000-0000-0000-0000-000000000001";
        private const string DefaultBranchId = "00000000-0000-0000-0000-000000000001";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create lookup tables first (users will reference these later)
            migrationBuilder.CreateTable(
                name: "asset_classes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_classes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_system_role = table.Column<bool>(type: "boolean", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "staffs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    display_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    photo_url = table.Column<string>(type: "text", nullable: true),
                    mobile_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    alternate_mobile_no = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    address_line1 = table.Column<string>(type: "text", nullable: false),
                    address_line2 = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: false),
                    state = table.Column<string>(type: "text", nullable: false),
                    pincode = table.Column<string>(type: "text", nullable: false),
                    emergency_contact_name = table.Column<string>(type: "text", nullable: false),
                    emergency_contact_number = table.Column<string>(type: "text", nullable: false),
                    employee_category = table.Column<int>(type: "integer", nullable: false),
                    joining_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    relieving_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    employment_status = table.Column<int>(type: "integer", nullable: false),
                    designation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    license_number = table.Column<string>(type: "text", nullable: true),
                    license_category = table.Column<string>(type: "text", nullable: true),
                    license_expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    experience_years = table.Column<int>(type: "integer", nullable: true),
                    operator_grade = table.Column<string>(type: "text", nullable: true),
                    daily_wage = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    salary = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    aadhaar_no = table.Column<string>(type: "text", nullable: true),
                    pan_no = table.Column<string>(type: "text", nullable: true),
                    license_document_url = table.Column<string>(type: "text", nullable: true),
                    id_proof_url = table.Column<string>(type: "text", nullable: true),
                    remarks = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_staffs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "staff_asset_classes",
                columns: table => new
                {
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_class_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_staff_asset_classes", x => new { x.staff_id, x.asset_class_id });
                    table.ForeignKey(
                        name: "fk_staff_asset_classes_asset_classes_asset_class_id",
                        column: x => x.asset_class_id,
                        principalTable: "asset_classes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_staff_asset_classes_staffs_staff_id",
                        column: x => x.staff_id,
                        principalTable: "staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_asset_classes_name",
                table: "asset_classes",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_roles_name",
                table: "roles",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_staff_asset_classes_asset_class_id",
                table: "staff_asset_classes",
                column: "asset_class_id");

            migrationBuilder.CreateIndex(
                name: "ix_staffs_email",
                table: "staffs",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_staffs_staff_code",
                table: "staffs",
                column: "staff_code",
                unique: true);

            // 2. Add new user columns as nullable (keep legacy role text until data is migrated)
            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_login_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "role_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "staff_id",
                table: "users",
                type: "uuid",
                nullable: true);

            // 3. Seed roles and backfill staff_id / role_id for existing users
            migrationBuilder.Sql($"""
                INSERT INTO roles (id, name, description, is_system_role, company_id, branch_id, created_at, is_deleted)
                VALUES
                    ('11111111-1111-1111-1111-111111111101', 'Admin', 'Full administrative permissions', true, '{DefaultCompanyId}', '{DefaultBranchId}', NOW() AT TIME ZONE 'UTC', false),
                    ('11111111-1111-1111-1111-111111111102', 'OfficeStaff', 'Rental desk and coordination staff', true, '{DefaultCompanyId}', '{DefaultBranchId}', NOW() AT TIME ZONE 'UTC', false),
                    ('11111111-1111-1111-1111-111111111103', 'Operator', 'Equipment machine operator', true, '{DefaultCompanyId}', '{DefaultBranchId}', NOW() AT TIME ZONE 'UTC', false),
                    ('11111111-1111-1111-1111-111111111104', 'Accounts', 'Billing and invoice management', true, '{DefaultCompanyId}', '{DefaultBranchId}', NOW() AT TIME ZONE 'UTC', false),
                    ('11111111-1111-1111-1111-111111111105', 'Manager', 'Management reviews and reports', true, '{DefaultCompanyId}', '{DefaultBranchId}', NOW() AT TIME ZONE 'UTC', false)
                ON CONFLICT (name) DO NOTHING;

                DO $$
                DECLARE
                    user_row RECORD;
                    new_staff_id uuid;
                    mapped_role_id uuid;
                    staff_counter int := 0;
                    empty_guid uuid := '00000000-0000-0000-0000-000000000000';
                BEGIN
                    FOR user_row IN
                        SELECT id, username, email, role, company_id, branch_id, staff_id
                        FROM users
                        WHERE staff_id IS NULL OR staff_id = empty_guid
                    LOOP
                        staff_counter := staff_counter + 1;
                        new_staff_id := gen_random_uuid();

                        mapped_role_id := (
                            SELECT id FROM roles
                            WHERE lower(name) = lower(COALESCE(NULLIF(trim(user_row.role), ''), 'OfficeStaff'))
                            LIMIT 1
                        );

                        IF mapped_role_id IS NULL THEN
                            IF lower(COALESCE(user_row.role, '')) LIKE '%admin%' THEN
                                SELECT id INTO mapped_role_id FROM roles WHERE name = 'Admin' LIMIT 1;
                            ELSIF lower(COALESCE(user_row.role, '')) LIKE '%operator%' THEN
                                SELECT id INTO mapped_role_id FROM roles WHERE name = 'Operator' LIMIT 1;
                            ELSIF lower(COALESCE(user_row.role, '')) LIKE '%manager%' THEN
                                SELECT id INTO mapped_role_id FROM roles WHERE name = 'Manager' LIMIT 1;
                            ELSIF lower(COALESCE(user_row.role, '')) LIKE '%account%' OR lower(COALESCE(user_row.role, '')) = 'accountant' THEN
                                SELECT id INTO mapped_role_id FROM roles WHERE name = 'Accounts' LIMIT 1;
                            ELSE
                                SELECT id INTO mapped_role_id FROM roles WHERE name = 'OfficeStaff' LIMIT 1;
                            END IF;
                        END IF;

                        INSERT INTO staffs (
                            id, staff_code, first_name, last_name, display_name, gender, date_of_birth,
                            mobile_no, email, address_line1, city, state, pincode,
                            emergency_contact_name, emergency_contact_number,
                            employee_category, joining_date, employment_status, designation, department,
                            company_id, branch_id, created_at, is_deleted
                        ) VALUES (
                            new_staff_id,
                            'STF-MIG-' || lpad(staff_counter::text, 4, '0'),
                            COALESCE(NULLIF(split_part(user_row.username, ' ', 1), ''), 'User'),
                            COALESCE(NULLIF(split_part(user_row.username, ' ', 2), ''), 'Account'),
                            COALESCE(NULLIF(user_row.username, ''), user_row.email),
                            'Unknown',
                            TIMESTAMPTZ '1990-01-01',
                            '0000000000',
                            user_row.email,
                            'Migration Address',
                            'N/A',
                            'N/A',
                            '000000',
                            'N/A',
                            '0000000000',
                            CASE WHEN (SELECT name FROM roles WHERE id = mapped_role_id) = 'Operator' THEN 0 ELSE 1 END,
                            NOW() AT TIME ZONE 'UTC',
                            0,
                            'Staff',
                            'General',
                            COALESCE(NULLIF(user_row.company_id, empty_guid), '{DefaultCompanyId}'::uuid),
                            COALESCE(NULLIF(user_row.branch_id, empty_guid), '{DefaultBranchId}'::uuid),
                            NOW() AT TIME ZONE 'UTC',
                            false
                        );

                        UPDATE users
                        SET staff_id = new_staff_id,
                            role_id = mapped_role_id,
                            is_active = true
                        WHERE id = user_row.id;

                        UPDATE staffs SET user_id = user_row.id WHERE id = new_staff_id;
                    END LOOP;
                END $$;
                """);

            // 4. Remove legacy role column and enforce NOT NULL on new FK columns
            migrationBuilder.DropColumn(
                name: "role",
                table: "users");

            migrationBuilder.AlterColumn<Guid>(
                name: "role_id",
                table: "users",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "staff_id",
                table: "users",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_role_id",
                table: "users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_staff_id",
                table: "users",
                column: "staff_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_users_roles_role_id",
                table: "users",
                column: "role_id",
                principalTable: "roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_users_staffs_staff_id",
                table: "users",
                column: "staff_id",
                principalTable: "staffs",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_users_roles_role_id",
                table: "users");

            migrationBuilder.DropForeignKey(
                name: "fk_users_staffs_staff_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "staff_asset_classes");

            migrationBuilder.DropTable(
                name: "asset_classes");

            migrationBuilder.DropTable(
                name: "staffs");

            migrationBuilder.DropIndex(
                name: "ix_users_role_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_staff_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_login_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "role_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "staff_id",
                table: "users");

            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
