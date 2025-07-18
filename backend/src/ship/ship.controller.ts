import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, UseFilters, UseGuards, Query, HttpException } from '@nestjs/common';
import { ShipService } from './ship.service';
import { ShipDto } from './dto/ship.dto';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { JwtGuard } from '../auth/common/guards/JwtGuard';
import { RolesGuard } from '../auth/common/guards/RolesGuard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Ship } from './entities/ship.entity';
import { Put } from '@nestjs/common';

@Controller('ship')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
@ApiBearerAuth('jwt')
export class ShipController {
  constructor(private readonly shipService: ShipService) { }

  @Post()
  @HttpCode(201)
  async create(@Body() shipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    return await this.shipService.create(shipDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(@Query('page', ParseIntPipe) page?: number, @Query('limit', ParseIntPipe) limit?: number, @Query('search') search?: string) {
    return this.shipService.findAll(page, limit, search);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Ship> {
    return await this.shipService.findOne(id);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: number, @Body() shipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    return await this.shipService.update(id, shipDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.shipService.remove(id);
  }

  @Put(':id/restore')
  @HttpCode(200)
  async restore(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.shipService.restore(id);
  }

  ////////////////////////////// AIS //////////////////////////// 
  @Get('external/:mmsi')
  async getExternalShip(@Param('mmsi') mmsi: string) {
    const url = `${process.env.AIS_API_URL}/${mmsi}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new HttpException('VesselFinder API error', response.status);
    }

    const data = await response.json();

    const shipDto = {
      name: data.name,
      type: typeFormat(data.type),
      imoNumber: data.imo,
      mmsiNumber: mmsi,
      flag: getCountryCode(data.country) || '',
      length: data.al,
      beam: data.aw,
      grossTonnage: data.gt,
      deadweight: data.dw,
      builtYear: data.yt,
      draft: data.draught,
      eta: data.etaTS ? new Date(data.etaTS * 1000) : undefined,
      departurePort: data.port,
      destinationPort: data.dest,
      status: mapAisStatusToEnum(data.ss),
    };

    return shipDto;
  }
}

function mapAisStatusToEnum(ss: number): string {
  switch (ss) {
    case 1:
      return "Demirde";
    case 5:
      return "Limanda";
    case 0:
    case 8:
    case 11:
    case 12:
      return "Yolda";
    case 14:
      return "Acil";
    case 2:
    case 3:
    case 4:
    case 6:
      return "Gecikmeli";
    case 9:
    case 10:
    case 15:
    default:
      return "Bilinimiyor";
  }
}

var countries = require("i18n-iso-countries");

function cleanCountryName(countryStr: string): string {
  return countryStr.split('(')[0].trim();
}

function getCountryCode(countryName: string): string | undefined {
  const cleanName = cleanCountryName(countryName);
  return countries.getAlpha2Code(cleanName, 'en');
}

function typeFormat(type: string): string {
  if (!type) return "Bilinmiyor";

  const t = type.toLowerCase();

  if (t.includes("passenger")) return "Passenger";
  if (t.includes("general")) return "GeneralCargo";
  if (t.includes("container")) return "ContainerShip";
  if (t.includes("bulk")) return "BulkCarrier";
  if (t.includes("refrigerated")) return "RefrigeratedCargo";
  if (t.includes("vehicle")) return "VehicleCarrier";
  if (t.includes("ro-ro")) return "RoRoCargo";
  if (t.includes("oil")) return "OilTanker";
  if (t.includes("gas")) return "GasTanker";
  if (t.includes("lpg")) return "LPGTanker";
  if (t.includes("lng")) return "LNGTanker";
  if (t.includes("tanker")) return "OtherTanker";
  if (t.includes("fishing")) return "Fishing";
  if (t.includes("tug")) return "Romorkor";
  if (t.includes("pilot")) return "Kılavuz";
  if (t.includes("search")) return "SearchAndRescue";
  if (t.includes("law")) return "LawEnforcement";
  if (t.includes("port")) return "PortTender";
  if (t.includes("anti")) return "AntiPollution";
  if (t.includes("diving")) return "DalgıçDestek";
  if (t.includes("military")) return "Askeri";
  if (t.includes("dredging")) return "Dredging";
  if (t.includes("sailing")) return "Sailing";
  if (t.includes("yacht")) return "Yacht";
  if (t.includes("research") || t.includes("survey")) return "ResearchSurvey";
  if (t.includes("medical")) return "Medical";
  if (t.includes("noncombatant")) return "Noncombatant";

  return "Bilinmiyor";
}

