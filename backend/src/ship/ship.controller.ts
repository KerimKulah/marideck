import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, UseFilters, UseGuards, Query, HttpException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ShipService } from './ship.service';
import { ShipDto } from './dto/ship.dto';
import { ExceptionFilterImp } from '../filters/exception-filter';
import { JwtGuard } from '../auth/common/guards/JwtGuard';
import { RolesGuard } from '../auth/common/guards/RolesGuard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { Ship } from './entities/ship.entity';
import { Put } from '@nestjs/common';

@Controller('ship')
@UseFilters(ExceptionFilterImp)
@UseGuards(JwtGuard, RolesGuard)
@Roles('admin', 'employee')
export class ShipController {
  constructor(private readonly shipService: ShipService) { }

  @Post()
  @HttpCode(201)
  async create(@Body() shipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    return await this.shipService.create(shipDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.shipService.findAll(page, limit, search, sortBy, sortOrder);
  }

  @Get('stats')
  @HttpCode(200)
  async getStats() {
    return this.shipService.getStatusStats();
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

  @Post('upload-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/images/ships',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `ship-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new HttpException('Sadece resim dosyaları yüklenebilir!', 400), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new HttpException('Dosya yüklenemedi', 400);
    }
    // URL'i döndür (frontend'den erişilebilir)
    const imageUrl = `/images/ships/${file.filename}`;
    return { imageUrl };
  }

  @Get('proxy-image')
  @HttpCode(200)
  async proxyImage(@Query('url') url: string) {
    if (!url) {
      throw new HttpException('URL parametresi gerekli', 400);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpException('Resim yüklenemedi', 400);
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      return {
        data: Buffer.from(buffer).toString('base64'),
        contentType
      };
    } catch (error) {
      throw new HttpException('Resim proxy hatası', 500);
    }
  }

  ////////////////////////////// AIS ////////////////////////////  
  @Get('ais/mmsi/:mmsi')
  async getAisShip(@Param('mmsi') mmsi: string) {
    const clickUrl = `${process.env.AIS_API_URL}/click/${mmsi}`;
    const vi2Url = `${process.env.AIS_API_URL}/vi2/${mmsi}`;


    try {
      // İlk olarak CLICK ve VI2 isteklerini paralel yap
      const [clickRes, vi2Res] = await Promise.allSettled([
        fetch(clickUrl),
        fetch(vi2Url),
      ]);

      if (clickRes.status !== "fulfilled" || !clickRes.value.ok) {
        throw new HttpException("Gemi bulunamadı", clickRes.status === "fulfilled" ? clickRes.value.status : 500);
      }

      const clickData = await clickRes.value.json();
      const vi2Data = vi2Res.status === "fulfilled" && vi2Res.value.ok
        ? await vi2Res.value.json()
        : null;

      // IMO numarası varsa ShipNext API'den netTonnage, callSign ve image bilgilerini al
      let shipNextData: { data?: { rt?: { nt?: number }; callSign?: string; images?: Array<{ url?: string }> } } | null = null;
      if (clickData.imo) {
        const shipNextUrl = `https://shipnext.com/api/v2/fleet/public/${clickData.imo}`;
        try {
          const shipNextRes = await fetch(shipNextUrl);
          if (shipNextRes.ok) {
            shipNextData = await shipNextRes.json();
          }
        } catch (error) {
          // ShipNext API hatası durumunda devam et
          console.warn('ShipNext API hatası:', error);
        }
      }

      const shipDto = {
        // CLICK verileri
        name: clickData.name ?? null,
        type: typeFormat(clickData.type),
        imoNumber: clickData.imo ?? null,
        mmsiNumber: mmsi,
        flag: getCountryCode(clickData.country) || null,
        length: clickData.al ?? null,
        beam: clickData.aw ?? null,
        grossTonnage: clickData.gt ?? null,
        deadweight: clickData.dw ?? null,
        builtYear: clickData.yt || clickData.y || null,
        draft: clickData.draught ?? null,

        // SHPNXT verileri
        netTonnage: shipNextData?.data?.rt?.nt ?? null,
        callsign: shipNextData?.data?.callSign ?? null,
        image: shipNextData?.data?.images?.[0]?.url ?? null,

        // VI2 + CLICK birleşimi (rota bilgileri)
        departurePort: vi2Data?.rpdna ?? null,
        departureCountry: vi2Data?.rpdco ?? null,
        departureTime: vi2Data?.rpdatd ? new Date(vi2Data.rpdatd * 1000) : null,
        destinationPort: vi2Data?.npde ?? clickData?.dest ?? null,
        eta: vi2Data?.npe
          ? new Date(vi2Data.npe * 1000)
          : clickData?.etaTS
            ? new Date(clickData.etaTS * 1000)
            : null,

        status: mapAisStatusToEnum(clickData.ss, clickData.r, clickData['.ns'], clickData.etaTS),
      };

      return shipDto;
    } catch (error) {
      throw new HttpException(
        `AIS verisi alınamadı: ${(error as Error).message}`,
        500,
      );
    }
  }

  @Get('ais/imo/:imo')
  async getShipByImo(@Param('imo') imo: string) {
    const mmsi = await getMmsiFromMarineTraffic(imo);

    if (!mmsi) {
      throw new HttpException('Gemi bulunamadı', 404);
    }

    // MMSI controller'ı kullanarak aynı veriyi üretelim (code reuse için)
    return this.getAisShip(mmsi);
  }
}

// AIS status to enum - Yeni kurallara göre
function mapAisStatusToEnum(ss: number, r?: number, ns?: number, etaTS?: number): string {
  const speed = ss; // ss = speed (hız)
  const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp

  // Kural 1: Eğer hız (ss) ≥ 3 knot ise → "Yolda"
  if (speed >= 3) {
    return "Yolda";
  }

  // Kural 2: Eğer hız < 0.5 knot ve (r = 1 veya r = 2 veya .ns = 1) ise → "Demirde"
  if (speed < 0.5 && (r === 1 || r === 2 || ns === 1)) {
    return "Demirde";
  }

  // Kural 3: Eğer hız < 0.5 knot ve (r = 5 veya .ns = 5) ise → "Limanda"
  if (speed < 0.5 && (r === 5 || ns === 5)) {
    return "Limanda";
  }

  // Kural 4: Eğer hız 0.5 ≤ ss < 3 ise → "Beklemede"
  if (speed >= 0.5 && speed < 3) {
    return "Beklemede";
  }

  // Kural 5: Eğer ETA (etaTS) geçmişteyse ve gemi hâlâ yolda görünüyorsa → "Gecikmeli"
  if (etaTS && etaTS < currentTime && speed >= 0.5) {
    return "Gecikmeli";
  }

  // Kural 6: Diğer tüm durumlar → "Bilinmiyor"
  return "Bilinmiyor";
}

var countries = require("i18n-iso-countries");

function cleanCountryName(countryStr: string): string {
  return countryStr?.split('(')[0].trim() ?? '';
}

function getCountryCode(countryName: string): string | undefined {
  const cleanName = cleanCountryName(countryName);
  return countries.getAlpha2Code(cleanName, 'en');
}

function typeFormat(type: string): string {
  if (!type) return "Bilinmiyor";

  const t = type.toLowerCase().replace(/\s+/g, '');

  const map: Record<string, string> = {
    passenger: "Passenger",
    general: "GeneralCargo",
    container: "ContainerShip",
    bulk: "BulkCarrier",
    refrigerated: "RefrigeratedCargo",
    vehicle: "VehicleCarrier",
    'ro-ro': "RoRoCargo",
    oil: "OilTanker",
    gas: "GasTanker",
    lpg: "LPGTanker",
    lng: "LNGTanker",
    tanker: "OtherTanker",
    fishing: "Fishing",
    tug: "Romorkor",
    pilot: "Kılavuz",
    search: "SearchAndRescue",
    law: "LawEnforcement",
    port: "PortTender",
    anti: "AntiPollution",
    diving: "DalgıçDestek",
    military: "Askeri",
    dredging: "Dredging",
    sailing: "Sailing",
    yacht: "Yacht",
    research: "ResearchSurvey",
    survey: "ResearchSurvey",
    medical: "Medical",
    noncombatant: "Noncombatant",
  };

  for (const key in map) {
    if (t.includes(key)) return map[key];
  }

  return "Bilinmiyor";
}

async function getMmsiFromMarineTraffic(imo: string): Promise<string | null> {
  const url = `https://www.marinetraffic.com/en/ais/details/ships/imo:${imo}/`;

  try {
    const response = await fetch(url, { redirect: "manual" });
    const location = response.headers.get("location");

    if (!location) return null;

    const match = location.match(/mmsi:(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
