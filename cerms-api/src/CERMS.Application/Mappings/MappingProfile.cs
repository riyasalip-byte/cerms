using AutoMapper;
using CERMS.Application.DTOs;
using CERMS.Domain.Entities;

namespace CERMS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Asset, AssetDto>().ReverseMap();
        CreateMap<RentalBooking, RentalDto>().ReverseMap();
        CreateMap<Invoice, InvoiceDto>().ReverseMap();
        CreateMap<InvoiceLineItem, InvoiceLineItemDto>().ReverseMap();
        CreateMap<User, UserDto>().ReverseMap();
    }
}
