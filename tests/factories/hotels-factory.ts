import { prisma } from "@/config";

export async function createHotel() {
    return prisma.hotel.createMany({
        data: [
            {
                name: "Hotel Fake1",
                image: "https://img.belmond.com/f_auto/t_320x249/photos/cop/cop-ext07.jpg"
            },
            {
                name: "Hotel Fake2",
                image: "https://img.belmond.com/f_auto/t_320x249/photos/cop/cop-ext07.jpg"
            }
        ]
    })
}

export async function createRooms(hotelId: number) {
    return prisma.room.createMany({
        data: [
            {
                name: "Fake Room 1",
                capacity: Math.floor(Math.random()*5),
                hotelId
            },
            {
                name: "Fake Room 2",
                capacity: Math.floor(Math.random()*5),
                hotelId
            }
        ]
    })
}

export async function getParamsId() {
    const enrollment = await prisma.enrollment.findFirst();
    const ticketType = await prisma.ticketType.findFirst();
    return {enrollmentId: enrollment.id, ticketTypeId: ticketType.id};
}