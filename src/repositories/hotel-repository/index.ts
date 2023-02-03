import { prisma } from "@/config";


export async function allHotels() {
    return prisma.hotel.findMany();
}