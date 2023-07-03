import { NextRequest, NextResponse } from "next/server";
import { UserInventory } from "@/lib/userInventory";
import { InventoryArmorRes } from "./types";
import { requireSession } from "@/lib/auth";
import { HttpError, type ErrorResponse } from "@/app/api/errors";
import { json } from "@/lib/http";

export async function GET(): Promise<
  NextResponse<InventoryArmorRes> | ErrorResponse
> {
  return await requireSession()
    .map(async (session) => {
      const inventory = new UserInventory(session.user);
      return { armor: await inventory.getAllArmor() };
    })
    .match<NextResponse<InventoryArmorRes> | ErrorResponse>(
      (data) => NextResponse.json(data),
      (err) => err.toResponse()
    );
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<InventoryArmorRes> | ErrorResponse> {
  return await requireSession()
    .andThen((session) =>
      json(request)
        .map((data) => ({ session, data }))
        .mapErr((error) => HttpError.badRequest(error.message))
    )
    .andThen(({ session, data }) =>
      InventoryArmorRes.parseNt(data)
        .map((validated) => ({
          session,
          validated,
        }))
        .mapErr((error) => HttpError.badRequest(error.toString()))
    )
    .andThen(({ session, validated }) => {
      const inventory = new UserInventory(session.user);
      return inventory
        .setArmorMany(validated.armor)
        .map(() => ({ inventory }))
        .mapErr(HttpError.mapErr);
    })
    .andThen(({ inventory }) =>
      inventory.getAllArmor().mapErr(HttpError.mapErr)
    )
    .match<NextResponse<InventoryArmorRes> | ErrorResponse>(
      (armor) => NextResponse.json({ armor }),
      (e) => e.toResponse()
    );
}
