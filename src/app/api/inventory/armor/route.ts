import { NextRequest, NextResponse } from "next/server";
import { UserInventory } from "@/lib/server/userInventory";
import { InventoryArmorRes } from "./types";
import { requireSession } from "@/lib/server/auth";
import { HttpError, type ErrorResponse } from "@/app/api/errors";
import { json } from "@/lib/server/http";

export async function GET(): Promise<
  NextResponse<InventoryArmorRes> | ErrorResponse
> {
  return await requireSession()
    .andThen((session) => {
      const inventory = new UserInventory(session.user);
      return inventory.getAllArmor().mapErr(HttpError.mapErr);
    })
    .match<NextResponse<InventoryArmorRes> | ErrorResponse>(
      (armor) => NextResponse.json({ armor }),
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
