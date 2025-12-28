import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppError } from "@/utils/appError";
import { SupplierService } from "./supplier.service";

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  /**
   * GET /api/v1/suppliers
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const suppliers = await this.supplierService.findAll();
    return res.status(200).json({
      status: "success",
      data: suppliers,
    });
  });

  /**
   * GET /api/v1/suppliers/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const supplier = await this.supplierService.getById(id);

    if (!supplier) {
      throw AppError.notFound("Supplier tidak ditemukan");
    }

    return res.status(200).json({
      status: "success",
      data: supplier,
    });
  });

  /**
   * POST /api/v1/suppliers
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await this.supplierService.create(req.body);
    return res.status(201).json({
      status: "success",
      message: "Supplier berhasil ditambahkan",
      data: supplier,
    });
  });

  /**
   * PATCH /api/v1/suppliers/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const supplier = await this.supplierService.update(id, req.body);
    return res.status(200).json({
      status: "success",
      message: "Supplier berhasil diperbarui",
      data: supplier,
    });
  });

  /**
   * DELETE /api/v1/suppliers/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    // Check if supplier has products
    const supplier = await this.supplierService.getById(id);
    if (supplier && supplier.products.length > 0) {
      throw AppError.badRequest(
        "Tidak dapat menghapus supplier yang memiliki produk",
      );
    }

    await this.supplierService.delete(id);
    return res.status(200).json({
      status: "success",
      message: "Supplier berhasil dihapus",
    });
  });
}
