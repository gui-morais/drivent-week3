import { prisma } from "@/config";


async function allHotels() {
    return prisma.hotel.findMany();
}

async function allRooms(id: number) {
    return prisma.hotel.findFirst({
        where: {
            id
        },
        include: {
            Rooms: true
        }
    });
}

const hotelRepository = {
    allHotels,
    allRooms
}

export default hotelRepository;