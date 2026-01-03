import type { PrismaClient } from "@repo/db";
import { paramsIdSchema } from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import type { BaseService } from "./service";

export class BaseController<T, S extends BaseService<T, keyof PrismaClient>> {
  protected service: S;

  constructor(service: S) {
    this.service = service;
  }

  /**
   * Menangani permintaan POST untuk membuat data baru.
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = (await this.service.create(req.body)) as T;
    new AppResponse<T>({
      res,
      data,
    });
  });

  /**
   * Menangani permintaan PUT untuk memperbarui data berdasarkan ID.
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = paramsIdSchema.parse(req.params);
    const data = (await this.service.update(id, req.body)) as T;
    new AppResponse<T>({
      res,
      data,
    });
  });

  /**
   * Menangani permintaan DELETE untuk menghapus data berdasarkan ID.
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = paramsIdSchema.parse(req.params);
    const data = (await this.service.delete(id)) as T;

    new AppResponse<T>({
      res,
      data,
    });
  });
}
