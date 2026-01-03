"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
const db_1 = require("@repo/db");
/**
 * BaseService adalah kelas dasar untuk service yang menggunakan Prisma ORM.
 * Kelas ini bisa di-extend oleh service spesifik untuk model tertentu.
 * Contoh penggunaan: class UserService extends BaseService<User> { ... }
 */
class BaseService {
    db;
    model; // Nama model Prisma, misalnya 'user'
    constructor(model) {
        this.db = db_1.db;
        this.model = model;
    }
    /**
     * Mendapatkan semua data dari model.
     * @param options Opsi pencarian Prisma (opsional).
     * @returns Array dari data model.
     */
    // async findAll(
    //   options?: Prisma.Args<PrismaClient[ModelName], "findMany">["args"]
    // ): Promise<T[]> {
    //   return (this.db[this.model] as any).findMany(options);
    // }
    /**
     * Mendapatkan satu data berdasarkan ID.
     * @param id ID data yang dicari.
     * @param options Opsi pencarian Prisma (opsional).
     * @returns Data model atau null jika tidak ditemukan.
     */
    // async findById(
    //   id: number | string,
    //   options?: Prisma.Args<PrismaClient[ModelName], "findUnique">["args"]
    // ): Promise<T | null> {
    //   return (this.db[this.model] as any).findUnique({
    //     where: { id },
    //     ...options,
    //   });
    // }
    /**
     * Membuat data baru.
     * @param data Data yang akan dibuat.
     * @returns Data yang baru dibuat.
     */
    async create(data, ...args) {
        return await this.db[this.model].create({ data });
    }
    /**
     * Memperbarui data berdasarkan ID.
     * @param id ID data yang akan diperbarui.
     * @param data Data yang akan diperbarui.
     * @returns Data yang telah diperbarui.
     */
    async update(id, data, ...args) {
        return await this.db[this.model].update({
            where: { id },
            data,
        });
    }
    /**
     * Menghapus data berdasarkan ID.
     * @param id ID data yang akan dihapus.
     * @returns Data yang telah dihapus.
     */
    async delete(id) {
        return await this.db[this.model].delete({
            where: { id },
        });
    }
}
exports.BaseService = BaseService;
