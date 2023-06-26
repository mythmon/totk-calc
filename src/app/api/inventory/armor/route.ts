import { NextRequest, NextResponse } from 'next/server';
import {getServerSession } from 'next-auth';
import { config } from '@/lib/config';
import { UserInventory } from '@/lib/userInventory';
import { z } from "zod";

export const InventoryArmorRes = z.object({
  armor: z.record(z.nullable(z.number()))
});

export type InventoryArmorRes = z.infer<typeof InventoryArmorRes>;

export async function GET(): Promise<NextResponse<InventoryArmorRes>> {
  const session = await getServerSession(config.auth);
  if (!session || !session.user) throw NextResponse.json({ error: "not signed in" }, { status: 401 });
  const inventory = new UserInventory(session.user);
  return NextResponse.json({ armor: await inventory.getAllArmor() });
}

export async function PATCH(request: NextRequest): Promise<NextResponse<InventoryArmorRes>> {
  const session = await getServerSession(config.auth);
  if (!session || !session.user) throw NextResponse.json({ error: "not signed in" }, { status: 401 });
  const data = InventoryArmorRes.parse(await request.json());
  const inventory = new UserInventory(session.user);
  inventory.setArmorMany(data.armor);
  return NextResponse.json({ armor: await inventory.getAllArmor() });
}
