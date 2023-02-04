import { AuthenticatedRequest } from "@/middlewares";
import hotelRepository from "@/repositories/hotel-repository";
import hotelService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try{
        await hotelService.checkExistingParams(userId);
        return res.status(httpStatus.OK).send(await hotelRepository.allHotels());
    } catch (error) {
        if(error.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(error.name === 'PaymentRequired') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function getRoomsOfHotel(req: AuthenticatedRequest, res: Response) {
    const { hotelId } = req.params
    const { userId } = req;
    try {
        await hotelService.checkExistingParams(userId);
        const hotel = await hotelRepository.allRooms(Number(hotelId))
        if(!hotel) {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.status(httpStatus.OK).send(hotel);
    } catch (error) {
        if(error.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(error.name === 'PaymentRequired') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}