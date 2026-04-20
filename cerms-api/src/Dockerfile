FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CERMS.Api/CERMS.Api.csproj", "CERMS.Api/"]
COPY ["CERMS.Application/CERMS.Application.csproj", "CERMS.Application/"]
COPY ["CERMS.Domain/CERMS.Domain.csproj", "CERMS.Domain/"]
COPY ["CERMS.Infrastructure/CERMS.Infrastructure.csproj", "CERMS.Infrastructure/"]
RUN dotnet restore "CERMS.Api/CERMS.Api.csproj"
COPY . .
WORKDIR "/src/CERMS.Api"
RUN dotnet build "CERMS.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CERMS.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "CERMS.Api.dll"]
