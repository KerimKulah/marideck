import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { CustomerDto } from './dto/customer-dto';

@Injectable()  
export class CustomerService {

    constructor(
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>) { }

    // GET ALL 
    async findAll(page?: number, limit?: number, search?: string): Promise<{
        customers: Customer[], customersCount: number, page?: number, limit?: number, totalPages?: number
    }> {

        const queryBuilder = this.customerRepo.createQueryBuilder('customer');

        if (search) {
            queryBuilder.andWhere(
                new Brackets((qb: WhereExpressionBuilder) => {
                    qb.where('customer.name ILIKE :search', { search: `%${search}%` })
                        .orWhere('customer.phone ILIKE :search', { search: `%${search}%` })
                        .orWhere('customer.company ILIKE :search', { search: `%${search}%` })
                        .orWhere('customer.email ILIKE :search', { search: `%${search}%` })
                        .orWhere('customer.customerType ILIKE :search', { search: `%${search}%` });
                }),
            );
        }

        queryBuilder.orderBy('customer.createdAt', 'DESC');

        if (page != null && limit != null) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const [customers, customersCount] = await queryBuilder.getManyAndCount();

        const result: { customers: Customer[], customersCount: number, page?: number, limit?: number, totalPages?: number } = {
            customers,
            customersCount,
        };

        if (page != null && limit != null) {
            result.page = page;
            result.limit = limit;
            result.totalPages = Math.ceil(customersCount / limit);
        }

        return result;
    }

    // GET ONE
    async findOne(id: number): Promise<Customer> {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    // CREATE
    async create(customerDto: CustomerDto): Promise<{ message: string, data: Customer }> {
        const existingCustomer = await this.customerRepo.findOne({
            where: { email: customerDto.email },
            withDeleted: true,
        });

        if (existingCustomer) {
            if (existingCustomer.deletedAt) {
                // Soft-deleted kaydı restore et, deletedAt'i null yap ve diğer alanları güncelle
                existingCustomer.deletedAt = null;

                // deletedAt ve id'yi yanlışlıkla overwrite etmemek için spread yapabiliriz
                const { deletedAt, id, ...rest } = existingCustomer;
                Object.assign(existingCustomer, customerDto);

                const savedCustomer = await this.customerRepo.save(existingCustomer);
                return { message: 'Customer restored successfully', data: savedCustomer };
            }
            throw new ConflictException('Customer with this email already exists');
        }

        // Yeni müşteri oluştur ve kaydet
        const newCustomer = this.customerRepo.create(customerDto);
        const savedCustomer = await this.customerRepo.save(newCustomer);
        return { message: 'Customer created successfully', data: savedCustomer };
    }

    // UPDATE
    async update(id: number, customerDto: CustomerDto): Promise<{ message: string, data: Customer }> {
        const customer = await this.findOne(id);
        this.customerRepo.merge(customer, customerDto);
        await this.customerRepo.save(customer);
        return { message: 'Customer updated successfully', data: customer };
    }

    // DELETE (SOFT)
    async delete(id: number): Promise<{ message: string }> {
        const customer = await this.findOne(id);
        await this.customerRepo.softDelete(customer.id);
        return { message: 'Customer soft deleted successfully' };
    }

    // RESTORE
    async restore(id: number): Promise<{ message: string }> {
        const customer = await this.customerRepo.findOne({ where: { id }, withDeleted: true });
        if (!customer) throw new NotFoundException('Customer not found');
        await this.customerRepo.restore(customer.id);
        return { message: 'Customer restored successfully' };
    }
}

