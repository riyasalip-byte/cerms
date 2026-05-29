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
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty))
            .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff != null ? src.Staff.DisplayName : string.Empty));
        CreateMap<Staff, StaffDto>()
            .ForMember(dest => dest.HasUserAccount, opt => opt.MapFrom(src => src.UserId != null));
        CreateMap<Staff, StaffDetailDto>()
            .ForMember(dest => dest.HasUserAccount, opt => opt.MapFrom(src => src.UserId != null))
            .ForMember(dest => dest.LinkedUserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.AllowedAssetClasses, opt => opt.MapFrom(src =>
                src.AllowedAssetClasses.Select(sa => sa.AssetClass)));
        CreateMap<AssetClass, AssetClassDto>();
        CreateMap<Role, RoleDto>();
        CreateMap<Customer, CustomerDto>().ReverseMap();
    }
}
