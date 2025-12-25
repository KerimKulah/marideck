import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, UseGuards, Query, HttpException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ShipService } from './ship.service';
import { ShipDto } from './dto/ship.dto';
import { JwtGuard } from '../auth/common/guards/JwtGuard';
import { RolesGuard } from '../auth/common/guards/RolesGuard';
import { Roles } from '../auth/common/decorators/roles.decorator';
import { Ship } from './entities/ship.entity';
import { Put } from '@nestjs/common';

@Controller('ship')
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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.shipService.findAll(pageNum, limitNum, search, sortBy, sortOrder);
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
    try {
      // Adım 1: IMO numarasını almak için eski endpoint'e istek at
      const clickUrl = `${process.env.AIS_API_URL}/click/${mmsi}`;
      const clickRes = await fetch(clickUrl);

      if (!clickRes.ok) {
        throw new HttpException("Gemi bulunamadı", clickRes.status);
      }

      const clickData = await clickRes.json();
      const imo = clickData.imo;

      if (!imo) {
        throw new HttpException("IMO numarası bulunamadı", 404);
      }

      // Adım 2: ShipNext API'den tüm veriyi al
      const shipNextUrl = `${process.env.SHIPNEXT_API_URL || 'https://shipnext.com/api/v2/fleet/public'}/${imo}`;
      const shipNextRes = await fetch(shipNextUrl);

      if (!shipNextRes.ok) {
        throw new HttpException("ShipNext API'den veri alınamadı", shipNextRes.status);
      }

      const shipNextData = await shipNextRes.json();

      // Adım 3: ShipNext verisini DTO formatına map'le
      const shipDto = {
        name: shipNextData?.data?.name ?? null,
        mmsiNumber: mmsi,
        imoNumber: shipNextData?.data?.imoNumber ?? imo ?? null,
        type: typeFormatShipNext(shipNextData?.data?.typeByPurpose, shipNextData?.data?.typeBySpecialty),
        flag: shipNextData?.data?.flag?.name
          ? getCountryCode(shipNextData.data.flag.name) || null
          : null,
        length: shipNextData?.data?.dimensions?.loa ?? null,
        beam: shipNextData?.data?.dimensions?.beam ?? null,
        grossTonnage: shipNextData?.data?.rt?.gt ?? null,
        netTonnage: shipNextData?.data?.rt?.nt ?? null,
        deadweight: shipNextData?.data?.deadWeight?.sDWT ?? null,
        draft: shipNextData?.data?.deadWeight?.sDraft ?? null,
        builtYear: shipNextData?.data?.blt ?? null,
        callsign: shipNextData?.data?.callSign ?? null,
        image: shipNextData?.data?.images?.[0]?.url ?? null,
        departurePort: shipNextData?.data?.lastKnownRoute?.from?.portId?.name ?? null,
        departureCountry: shipNextData?.data?.lastKnownRoute?.from?.portId?.country?.name
          ? getCountryCode(shipNextData.data.lastKnownRoute.from.portId.country.name) || null
          : null,
        departureTime: shipNextData?.data?.lastKnownRoute?.from?.date
          ? new Date(shipNextData.data.lastKnownRoute.from.date)
          : null,
        destinationPort: shipNextData?.data?.lastKnownRoute?.to?.portId?.name ?? null,
        eta: shipNextData?.data?.lastKnownRoute?.to?.date
          ? new Date(shipNextData.data.lastKnownRoute.to.date)
          : null,
        status: mapShipNextStatus(
          shipNextData?.data?.location?.speed,
          shipNextData?.data?.lastKnownRoute?.to?.date
        ),
      };

      return shipDto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `AIS verisi alınamadı: ${(error as Error).message}`,
        500,
      );
    }
  }

  @Get('ais/imo/:imo')
  async getShipByImo(@Param('imo') imo: string) {
    try {
      // Direkt ShipNext API'ye IMO ile istek at
      const shipNextUrl = `${process.env.SHIPNEXT_API_URL || 'https://shipnext.com/api/v2/fleet/public'}/${imo}`;
      const shipNextRes = await fetch(shipNextUrl);

      if (!shipNextRes.ok) {
        throw new HttpException("Gemi bulunamadı", shipNextRes.status);
      }

      const shipNextData = await shipNextRes.json();

      // ShipNext verisini DTO formatına map'le
      const shipDto = {
        name: shipNextData?.data?.name ?? null,
        mmsiNumber: shipNextData?.data?.mmsi ?? null,
        imoNumber: shipNextData?.data?.imoNumber ?? imo ?? null,
        type: typeFormatShipNext(shipNextData?.data?.typeByPurpose, shipNextData?.data?.typeBySpecialty),
        flag: shipNextData?.data?.flag?.name
          ? getCountryCode(shipNextData.data.flag.name) || null
          : null,
        length: shipNextData?.data?.dimensions?.loa ?? null,
        beam: shipNextData?.data?.dimensions?.beam ?? null,
        grossTonnage: shipNextData?.data?.rt?.gt ?? null,
        netTonnage: shipNextData?.data?.rt?.nt ?? null,
        deadweight: shipNextData?.data?.deadWeight?.sDWT ?? null,
        draft: shipNextData?.data?.deadWeight?.sDraft ?? null,
        builtYear: shipNextData?.data?.blt ?? null,
        callsign: shipNextData?.data?.callSign ?? null,
        image: shipNextData?.data?.images?.[0]?.url ?? null,
        departurePort: shipNextData?.data?.lastKnownRoute?.from?.portId?.name ?? null,
        departureCountry: shipNextData?.data?.lastKnownRoute?.from?.portId?.country?.name
          ? getCountryCode(shipNextData.data.lastKnownRoute.from.portId.country.name) || null
          : null,
        departureTime: shipNextData?.data?.lastKnownRoute?.from?.date
          ? new Date(shipNextData.data.lastKnownRoute.from.date)
          : null,
        destinationPort: shipNextData?.data?.lastKnownRoute?.to?.portId?.name ?? null,
        eta: shipNextData?.data?.lastKnownRoute?.to?.date
          ? new Date(shipNextData.data.lastKnownRoute.to.date)
          : null,
        status: mapShipNextStatus(
          shipNextData?.data?.location?.speed,
          shipNextData?.data?.lastKnownRoute?.to?.date
        ),
      };

      return shipDto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `AIS verisi alınamadı: ${(error as Error).message}`,
        500,
      );
    }
  }
}

// ShipNext status mapping - Speed bazlı
function mapShipNextStatus(speed?: number, etaDate?: string | Date): string {
  const currentSpeed = speed ?? 0;
  const currentTime = Date.now();

  // ETA'yı kontrol et (string veya Date olabilir)
  let etaTimestamp: number | null = null;
  if (etaDate) {
    const eta = typeof etaDate === 'string' ? new Date(etaDate) : etaDate;
    etaTimestamp = eta.getTime();
  }

  // Kural 1: Speed < 0.5 ise → "Demirde/Limanda" (genel olarak "Demirde" döndürüyoruz)
  if (currentSpeed < 0.5) {
    return "Demirde";
  }

  // Kural 2: Speed >= 3 ise → "Yolda"
  if (currentSpeed >= 3) {
    // Kural 5: ETA geçmişteyse ve Speed > 0.5 ise → "Gecikmeli"
    if (etaTimestamp && etaTimestamp < currentTime) {
      return "Gecikmeli";
    }
    return "Yolda";
  }

  // Kural 3: 0.5 <= Speed < 3 ise → "Beklemede"
  if (currentSpeed >= 0.5 && currentSpeed < 3) {
    // Kural 5: ETA geçmişteyse ve Speed > 0.5 ise → "Gecikmeli"
    if (etaTimestamp && etaTimestamp < currentTime) {
      return "Gecikmeli";
    }
    return "Beklemede";
  }

  // Kural 4: Diğer tüm durumlar → "Bilinmiyor"
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

// String'i normalize et (uppercase, space/underscore/hyphen'leri kaldır)
function normalizeTypeString(str: string): string {
  return str
    .toUpperCase()
    .replace(/[\s_\-]/g, '') // Space, underscore, hyphen'leri kaldır
    .trim();
}

// ShipNext type format mapping - typeBySpecialty öncelikli
function typeFormatShipNext(typeByPurpose?: string, typeBySpecialty?: string): string {
  // Önce typeBySpecialty'ye bak (varsa ve doluysa)
  if (typeBySpecialty && typeBySpecialty.trim()) {
    const specialtyResult = mapTypeString(typeBySpecialty);
    if (specialtyResult !== "Bilinmiyor") {
      return specialtyResult;
    }
  }

  // typeBySpecialty boşsa veya match bulunamazsa typeByPurpose'e bak
  if (typeByPurpose && typeByPurpose.trim()) {
    return mapTypeString(typeByPurpose);
  }

  return "Bilinmiyor";
}

// Ortak mapping fonksiyonu (her iki alan için aynı mantık)
function mapTypeString(input: string): string {
  if (!input) return "Bilinmiyor";

  // Gelen değeri normalize et
  const normalizedInput = normalizeTypeString(input);

  const map: Record<string, string> = {
    'MPP': "GeneralCargo",
    'GENERAL CARGO': "GeneralCargo",
    'BULK': "BulkCarrier",
    'BULK CARRIER': "BulkCarrier",
    'HANDYSIZE BULK CARRIER': "BulkCarrier",
    'PANAMAX BULK CARRIER': "BulkCarrier",
    'CAPESIZE BULK CARRIER': "BulkCarrier",
    'SUPRAMAX BULK CARRIER': "BulkCarrier",
    'HANDYMAX BULK CARRIER': "BulkCarrier",
    'CONTAINER': "ContainerShip",
    'CONTAINER SHIP': "ContainerShip",
    'FEEDER CONTAINER': "ContainerShip",
    'PANAMAX CONTAINER': "ContainerShip",
    'POST PANAMAX CONTAINER': "ContainerShip",
    'TANKER': "OilTanker",
    'TANK': "OilTanker",
    'OIL TANKER': "OilTanker",
    'OIL PRODUCTS TANKER': "OilTanker",
    'CRUDE OIL TANKER': "OilTanker",
    'CHEMICAL/OIL PRODUCTS TANKER': "OilTanker",
    'CHEMICAL TANKER': "OtherTanker",
    'CHEMICAL': "OtherTanker",
    'GAS TANKER': "GasTanker",
    'LPG': "LPGTanker",
    'LNG': "LNGTanker",
    'LNG TANKER': "LNGTanker",
    'LPG TANKER': "LPGTanker",
    'REEFER': "RefrigeratedCargo",
    'REFRIGERATED': "RefrigeratedCargo",
    'REFRIGERATED CARGO': "RefrigeratedCargo",
    'RO-RO': "RoRoCargo",
    'RORO': "RoRoCargo",
    'RO-RO CARGO': "RoRoCargo",
    'CAR': "VehicleCarrier",
    'CAR CARRIER': "VehicleCarrier",
    'VEHICLE CARRIER': "VehicleCarrier",
    'PASSENGER': "Passenger",
    'PASSENGER SHIP': "Passenger",
    'FISHING': "Fishing",
    'FISHING VESSEL': "Fishing",
    'TUG': "Romorkor",
    'TUG BOAT': "Romorkor",
    'PILOT': "Kılavuz",
    'PILOT VESSEL': "Kılavuz",
    'SEARCH AND RESCUE': "SearchAndRescue",
    'SAR': "SearchAndRescue",
    'LAW ENFORCEMENT': "LawEnforcement",
    'PORT TENDER': "PortTender",
    'ANTI POLLUTION': "AntiPollution",
    'DIVING SUPPORT': "DalgıçDestek",
    'MILITARY': "Askeri",
    'DREDGING': "Dredging",
    'DREDGER': "Dredging",
    'SAILING': "Sailing",
    'SAILING VESSEL': "Sailing",
    'YACHT': "Yacht",
    'RESEARCH': "ResearchSurvey",
    'SURVEY': "ResearchSurvey",
    'RESEARCH VESSEL': "ResearchSurvey",
    'SURVEY VESSEL': "ResearchSurvey",
    'MEDICAL': "Medical",
    'NONCOMBATANT': "Noncombatant",
  };

  // Önce exact match kontrolü (normalize edilmiş değerlerle)
  for (const key in map) {
    const normalizedKey = normalizeTypeString(key);
    if (normalizedInput === normalizedKey) {
      return map[key];
    }
  }

  // Sonra kısmi eşleşme kontrolü (normalize edilmiş değerlerle)
  // Önce daha uzun key'leri kontrol et (daha spesifik eşleşme için)
  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const normalizedKey = normalizeTypeString(key);

    // İki yönlü kontrol: input içinde key var mı veya key içinde input var mı?
    if (normalizedInput.includes(normalizedKey) || normalizedKey.includes(normalizedInput)) {
      return map[key];
    }

    // Kelime bazlı eşleşme: Her iki tarafta da ortak kelimeler var mı?
    const inputWords = normalizedInput.match(/.{2,}/g) || []; // En az 2 karakterlik kelimeler
    const keyWords = normalizedKey.match(/.{2,}/g) || [];

    // Eğer ortak bir kelime varsa (en az 3 karakter) eşleş
    for (const inputWord of inputWords) {
      if (inputWord.length >= 3) {
        for (const keyWord of keyWords) {
          if (inputWord === keyWord || inputWord.includes(keyWord) || keyWord.includes(inputWord)) {
            return map[key];
          }
        }
      }
    }
  }

  return "Bilinmiyor";
}

