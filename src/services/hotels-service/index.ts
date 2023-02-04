import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import userRepository from "@/repositories/user-repository";

async function checkExistingParams(userId: number) {
    const user = await userRepository.findUserById(userId);
    if(!user) {
        throw notFoundError();
    }

    const enrollments = await enrollmentRepository.getEnrollmentsByUserId(userId);
    if(!enrollments) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollments.id);
    if(!ticket) {
        throw notFoundError();
    }

    if(ticket.status!=="PAID" || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
        throw {name: "PaymentRequired"}
    }
}

const hotelService = {
    checkExistingParams
};

export default hotelService;