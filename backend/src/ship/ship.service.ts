import { Injectable, NotFoundException } from '@nestjs/common';
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
    const ship = this.shipRepository.create(createShipDto);
    await this.shipRepository.save(ship);
    return { message: 'Ship created successfully', data: ship };
  }

  // GET ALL
  async findAll(page?: number, limit?: number, search?: string): Promise<{
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

    queryBuilder.orderBy('ship.createdAt', 'DESC');

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
    const ship = await this.shipRepository.findOne({ where: { id }, relations: ['customer'] });
    if (!ship) throw new NotFoundException('Ship not found');
    return ship;
  }

  // UPDATE
  async update(id: number, updateShipDto: ShipDto): Promise<{ message: string, data: Ship }> {
    const ship = await this.shipRepository.findOne({ where: { id }, relations: ['customer'] });
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
}
