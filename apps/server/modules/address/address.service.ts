import type { Addresses } from "@repo/db";
import type { CreateAddressInput, UpdateAddressInput } from "@repo/schema";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class AddressService extends BaseService<Addresses, "addresses"> {
  constructor() {
    super("addresses");
  }

  findAll = async (userId: string) => {
    const addresses = await this.db[this.model].findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        is_default: "desc",
      },
    });

    return addresses;
  };

  create = async (data: CreateAddressInput) => {
    // kalau user ingin alamat ini jadi default
    if (data.is_default) {
      await this.db[this.model].updateMany({
        where: { user_id: data.user_id },
        data: { is_default: false },
      });
    }

    const newAddress = await this.db[this.model].create({
      data,
    });

    return newAddress;
  };
  update = async (id: number, data: UpdateAddressInput) => {
    const address = await this.db[this.model].findFirst({ where: { id } });

    if (!address) throw AppError.notFound();

    // kalau ingin menjadikan alamat ini default
    if (data.is_default) {
      await this.db[this.model].updateMany({
        where: {
          user_id: address.user_id,
          id: { not: id }, // semua kecuali yang diupdate
        },
        data: { is_default: false },
      });
    }

    const updatedAddress = await this.db[this.model].update({
      where: { id },
      data: {
        address_line1: data.address_line1 ?? address.address_line1,
        address_line2: data.address_line2 ?? address.address_line2,
        label: data.label ?? address.label,
        city: data.city ?? address.city,
        country: data.country ?? address.country,
        is_default: data.is_default ?? address.is_default,
        lat: data.lat ?? address.lat,
        lng: data.lng ?? address.lng,
        phone: data.phone ?? address.phone,
        postal_code: data.postal_code ?? address.postal_code,
        province: data.province ?? address.province,
        recipient_name: data.recipient_name ?? address.recipient_name,
      },
    });

    return updatedAddress;
  };

  delete = async (id: number) => {
    const deletedAddress = await this.db[this.model].delete({
      where: {
        id,
      },
    });

    return deletedAddress;
  };
}
