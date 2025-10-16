import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { CustomerDto } from './dto/customer-dto';
import { OperationStatus } from '../operation/enums/operation-status.enum';

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>) { }

    // GET ALL 
    async findAll(page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        customers: Customer[], customersCount: number, page?: number, limit?: number, totalPages?: number
    }> {

        const queryBuilder = this.customerRepo.createQueryBuilder('customer')
            .leftJoinAndSelect('customer.operations', 'operations', 'operations.status IN (:...activeStatuses)', {
                activeStatuses: [OperationStatus.PLANNED, OperationStatus.IN_PROGRESS]
            });

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

        // Sorting
        if (sortBy && sortOrder) {
            const allowedSortFields = ['name', 'company', 'email', 'country', 'createdAt'];
            if (allowedSortFields.includes(sortBy)) {
                queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);
            } else {
                queryBuilder.orderBy('customer.createdAt', 'DESC');
            }
        } else {
            queryBuilder.orderBy('customer.createdAt', 'DESC');
        }

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

    // GET CUSTOMER STATISTICS
    async getCustomerStatistics(): Promise<{
        totalCustomers: number;
        uniqueCountries: number;
        customersWithActiveOperations: number;
        customersAddedThisWeek: number;
    }> {
        // Toplam müşteri sayısı
        const totalCustomers = await this.customerRepo.count();

        // Farklı ülke sayısı (sadece gerçek ülke adları, NULL ve "Bilinmiyor" hariç)
        const uniqueCountries = await this.customerRepo
            .createQueryBuilder('customer')
            .select('COUNT(DISTINCT customer.country)', 'count')
            .where('customer.country IS NOT NULL AND customer.country != \'Bilinmiyor\'')
            .getRawOne();

        // Aktif operasyonu olan müşteri sayısı
        const customersWithActiveOperations = await this.customerRepo
            .createQueryBuilder('customer')
            .leftJoin('customer.operations', 'operations', 'operations.status IN (:...activeStatuses)', {
                activeStatuses: [OperationStatus.PLANNED, OperationStatus.IN_PROGRESS]
            })
            .where('operations.id IS NOT NULL')
            .getCount();

        // Bu hafta eklenen müşteri sayısı
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Pazartesi
        startOfWeek.setHours(0, 0, 0, 0);

        const customersAddedThisWeek = await this.customerRepo
            .createQueryBuilder('customer')
            .where('customer.createdAt >= :startOfWeek', { startOfWeek })
            .getCount();

        return {
            totalCustomers,
            uniqueCountries: parseInt(uniqueCountries.count) || 0,
            customersWithActiveOperations,
            customersAddedThisWeek
        };
    }
}

