import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ShipDto } from './dto/ship.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ship } from './entities/ship.entity';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';

@Injectable()
export class ShipService {
  constructor(
    @InjectRepository(Ship) private shipRepository: Repository<Ship>,
  ) { }


  // CREATE
  async create(createShipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    // Query builder ile soft delete dahil arama yapılıyor
    const existingShip = await this.shipRepository
      .createQueryBuilder('ship')
      .withDeleted()
      .where('ship.imoNumber = :imoNumber', { imoNumber: createShipDto.imoNumber })
      .orWhere('ship.mmsiNumber = :mmsiNumber', { mmsiNumber: createShipDto.mmsiNumber })
      .orWhere('ship.callsign = :callsign', { callsign: createShipDto.callsign })
      .getOne();

    if (existingShip) {
      if (existingShip.deletedAt) {
        // Soft-deleted ise restore et ama deletedAt dışında güncelle
        const { deletedAt, id, ...rest } = existingShip;
        Object.assign(existingShip, createShipDto);
        existingShip.deletedAt = null; // restore için null yap

        const savedShip = await this.shipRepository.save(existingShip);
        return { message: 'Ship restored successfully', data: savedShip };
      }

      // Çakışan alanı tespit et
      const conflictField = (() => {
        if (existingShip.imoNumber === createShipDto.imoNumber) return 'IMO number';
        if (existingShip.mmsiNumber === createShipDto.mmsiNumber) return 'MMSI number';
        if (existingShip.callsign === createShipDto.callsign) return 'callsign';
        return 'unique identifier';
      })();

      throw new ConflictException(`Ship with this ${conflictField} already exists`);
    }

    // Yeni kayıt oluştur
    const newShip = this.shipRepository.create(createShipDto);
    const savedShip = await this.shipRepository.save(newShip);
    return { message: 'Ship created successfully', data: savedShip };
  }


  // GET ALL
  async findAll(page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
    ships: Ship[]; shipsCount: number; page?: number; limit?: number; totalPages?: number;
  }> {
    const queryBuilder = this.shipRepository.createQueryBuilder('ship');

    if (search) {
      const searchTerm = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('ship.name ILIKE :search', { search: searchTerm })
            .orWhere('ship.imoNumber ILIKE :search', { search: searchTerm })
        })
      );
    }

    // Sorting
    const allowedSortFields: Record<string, string> = {
      createdAt: 'ship.createdAt',
      updatedAt: 'ship.updatedAt',
      eta: 'ship.eta',
      name: 'ship.name',
    };
    const orderField = sortBy && allowedSortFields[sortBy] ? allowedSortFields[sortBy] : 'ship.createdAt';
    const orderDirection: 'ASC' | 'DESC' = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';

    queryBuilder.orderBy(orderField, orderDirection);

    // Eğer hem page hem limit varsa, skip ve take uygula
    if (page != null && limit != null) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [ships, shipsCount] = await queryBuilder.getManyAndCount();

    const result: { ships: Ship[], shipsCount: number, page?: number, limit?: number, totalPages?: number } = {
      ships,
      shipsCount,
    };

    // Eğer sayfalama varsa totalPages ekle
    if (page != null && limit != null) {
      result.page = page;
      result.limit = limit;
      result.totalPages = Math.ceil(shipsCount / limit);
    }

    return result;
  }

  // GET ONE
  async findOne(id: number): Promise<Ship> {
    const ship = await this.shipRepository.findOne({ where: { id } });
    if (!ship) throw new NotFoundException('Ship not found');
    return ship;
  }

  // UPDATE
  async update(id: number, updateShipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    const ship = await this.shipRepository.findOne({ where: { id } });
    if (!ship) throw new NotFoundException('Ship not found');
    const updatedShip = this.shipRepository.merge(ship, updateShipDto);
    await this.shipRepository.save(updatedShip);
    return { message: 'Ship updated successfully', data: updatedShip };
  }

  // DELETE (SOFT)
  async remove(id: number): Promise<{ message: string }> {
    const ship = await this.shipRepository.findOne({ where: { id } });
    if (!ship) throw new NotFoundException('Ship not found');
    await this.shipRepository.softRemove(ship);
    return { message: 'Ship deleted successfully' };
  }

  // RESTORE
  async restore(id: number): Promise<{ message: string }> {
    const ship = await this.shipRepository.findOne({ where: { id }, withDeleted: true });
    if (!ship) throw new NotFoundException('Ship not found');
    await this.shipRepository.restore(ship.id);
    return { message: 'Ship restored successfully' };
  }

  // STATS: counts by status
  async getStatusStats(): Promise<{
    totalShips: number;
    byStatus: Record<string, number>;
  }> {
    const totalShips = await this.shipRepository.count();

    const rows = await this.shipRepository.createQueryBuilder('ship')
      .select('ship.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ship.status')
      .getRawMany<{ status: string | null, count: string }>();

    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status ?? 'Bilinmiyor';
      byStatus[key] = parseInt(r.count, 10) || 0;
    }

    // Ensure standard keys exist even if zero
    for (const k of ['Beklemede','Yolda','Demirde','Gecikmeli','Acil','Bilinmiyor','Limanda']) {
      if (byStatus[k] == null) byStatus[k] = 0;
    }

    return { totalShips, byStatus };
  }
}
