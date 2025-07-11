import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipDto } from './dto/create-ship.dto';
import { UpdateShipDto } from './dto/update-ship.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ship } from './entities/ship.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShipService {
  constructor(
    @InjectRepository(Ship) private shipRepository: Repository<Ship>,
  ) { }


  // CREATE
  async create(createShipDto: CreateShipDto): Promise<{ message: string, data: Ship }> {
    const ship = this.shipRepository.create(createShipDto);
    await this.shipRepository.save(ship);
    return { message: 'Ship created successfully', data: ship };
  }

  // GET ALL
  async findAll(page?: number, limit?: number): Promise<Ship[]> {
    if (page != null && limit != null) {
      return this.shipRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
    }
    return this.shipRepository.find({ order: { createdAt: 'DESC' } });
  }

  // GET ONE
  async findOne(id: number): Promise<Ship> {
    const ship = await this.shipRepository.findOne({ where: { id } });
    if (!ship) throw new NotFoundException('Ship not found');
    return ship;
  }

  // UPDATE
  async update(id: number, updateShipDto: UpdateShipDto): Promise<{ message: string, data: Ship }> {
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
}
