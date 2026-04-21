using CERMS.Application.Interfaces;
using CERMS.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;

namespace CERMS.Infrastructure.Services;

public class InvoicePdfService : IInvoicePdfService
{
    public InvoicePdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(Invoice invoice, Customer customer)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("CERMS").FontSize(24).Bold().FontColor(Colors.Blue.Medium);
                        col.Item().Text("Corporate Equipment Rental Management System");
                        col.Item().Text("123 Business Avenue, Tech City");
                        col.Item().Text("Phone: +1 234 567 890");
                    });

                    row.RelativeItem().AlignRight().Column(col =>
                    {
                        col.Item().Text("INVOICE").FontSize(20).Bold();
                        col.Item().Text(text =>
                        {
                            text.Span("Invoice #: ").Bold();
                            text.Span(invoice.InvoiceNumber);
                        });
                        col.Item().Text(text =>
                        {
                            text.Span("Date: ").Bold();
                            text.Span(invoice.IssuedDate.ToString("MMM dd, yyyy"));
                        });
                    });
                });

                page.Content().PaddingVertical(20).Column(col =>
                {
                    // Customer Details
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(customerCol =>
                        {
                            customerCol.Item().Text("Bill To:").Bold();
                            customerCol.Item().Text(customer.Name);
                            customerCol.Item().Text(customer.Email);
                            customerCol.Item().Text(customer.Phone);
                        });
                    });

                    col.Item().PaddingTop(20).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Description");
                            header.Cell().Element(CellStyle).AlignCenter().Text("Quantity");
                            header.Cell().Element(CellStyle).AlignRight().Text("Unit Price");
                            header.Cell().Element(CellStyle).AlignRight().Text("Total");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.Bold())
                                                .PaddingVertical(5)
                                                .BorderBottom(1)
                                                .BorderColor(Colors.Black);
                            }
                        });

                        foreach (var item in invoice.LineItems)
                        {
                            table.Cell().Element(ContentStyle).Text(item.Description);
                            table.Cell().Element(ContentStyle).AlignCenter().Text(item.Quantity.ToString());
                            table.Cell().Element(ContentStyle).AlignRight().Text(item.UnitPrice.ToString("C"));
                            table.Cell().Element(ContentStyle).AlignRight().Text(item.TotalPrice.ToString("C"));

                            static IContainer ContentStyle(IContainer container)
                            {
                                return container.PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2);
                            }
                        }
                    });

                    col.Item().AlignRight().PaddingTop(20).Column(summaryCol =>
                    {
                        summaryCol.Item().Row(row =>
                        {
                            row.ConstantItem(100).Text("Subtotal:").Bold();
                            row.ConstantItem(100).AlignRight().Text(invoice.Subtotal.ToString("C"));
                        });

                        summaryCol.Item().Row(row =>
                        {
                            row.ConstantItem(100).Text("Tax (10%):").Bold();
                            row.ConstantItem(100).AlignRight().Text(invoice.Tax.ToString("C"));
                        });

                        summaryCol.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(100).Text("Total:").FontSize(12).Bold();
                            row.ConstantItem(100).AlignRight().Text(invoice.Total.ToString("C")).FontSize(12).Bold();
                        });

                        summaryCol.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(100).Text("Amount Paid:").Bold().FontColor(Colors.Green.Medium);
                            row.ConstantItem(100).AlignRight().Text(invoice.AmountPaid.ToString("C")).FontColor(Colors.Green.Medium);
                        });

                        summaryCol.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(100).Text("Balance Due:").Bold().FontColor(Colors.Red.Medium);
                            row.ConstantItem(100).AlignRight().Text(invoice.BalanceDue.ToString("C")).Bold().FontColor(Colors.Red.Medium);
                        });
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                });
            });
        });

        return document.GeneratePdf();
    }
}
