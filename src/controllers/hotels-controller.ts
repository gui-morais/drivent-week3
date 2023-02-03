import { AuthenticatedRequest } from "@/middlewares";
import { allHotels } from "@/repositories/hotel-repository";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    try{
        return res.status(httpStatus.OK).send(await allHotels());
    } catch (error) {
        return res.sendStatus(httpStatus.NOT_FOUND);
    }
}