using AutoMapper;
using CERMS.Application.DTOs;
using CERMS.Domain.Entities;

namespace CERMS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Asset, AssetDto>()
            .ForMember(dest => dest.AssetCategoryName, opt => opt.MapFrom(src => src.AssetCategory != null ? src.AssetCategory.Name : string.Empty))
            .ReverseMap();
        CreateMap<Asset, AssetDetailDto>()
            .ForMember(dest => dest.AssetCategoryName, opt => opt.MapFrom(src => src.AssetCategory != null ? src.AssetCategory.Name : string.Empty))
            .ReverseMap();
        CreateMap<MaintenanceRecord, MaintenanceRecordDto>()
            .ForMember(dest => dest.MaintenanceTypeName, opt => opt.MapFrom(src => src.MaintenanceType != null ? src.MaintenanceType.Name : string.Empty))
            .ReverseMap();
        CreateMap<RentalBooking, RentalDto>().ReverseMap();
        CreateMap<Invoice, InvoiceDto>().ReverseMap();
        CreateMap<InvoiceLineItem, InvoiceLineItemDto>().ReverseMap();
        CreateMap<User, UserDto>().ReverseMap();
        CreateMap<Customer, CustomerDto>().ReverseMap();
    }
}
