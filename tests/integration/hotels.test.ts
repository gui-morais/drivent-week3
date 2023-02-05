import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createRemoteTicketType, createRooms, createTicket, createTicketTypeWithHotel, createTicketTypeWithoutHotel, createUser, getParamsId } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
})

beforeEach(async () => {
    await cleanDb();
})

const server = supertest(app);

 describe("GET /hotels", () => {
     it("should respond with status 401 if no token is given", async () => {
         const response = await server.get("/hotels");
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
     });

     it("should respond with status 401 if given token is not valid", async () => {
         const token = faker.lorem.word();
    
         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
     });

     it("should respond with status 401 if there is no session for given token", async () => {
         const userWithoutSession = await createUser();
         const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
       });
 })

 describe("when token is valid", () => {
     it("should respond with status 404 if thisn't a enrollment for user", async () => {
         const token = await generateValidToken();

         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.NOT_FOUND);
     })

     it("should respond with status 404 if thisn't a ticket for user", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);

         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.NOT_FOUND);
     })

     it("should respond with status 402 if the ticket isn't paid", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");

         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 402 if the ticket is remote", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createRemoteTicketType();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");

         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 402 if the ticket hasn't hotel", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithoutHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");

         const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 200 and with empty array when there are no hotels created", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");

       const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

       expect(response.status).toBe(httpStatus.OK);
       expect(response.body).toEqual([]);
     })

     it("should respond with status 200 and with existing Hotels data", async () => {
       const token = await generateValidToken();
       const user = await prisma.user.findFirst();
       await createEnrollmentWithAddress(user);
       await createTicketTypeWithHotel();
       const userInfos = await getParamsId();
       await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
       await createHotel();

       const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

       expect(response.status).toBe(httpStatus.OK);
       expect(response.body).toEqual(expect.arrayContaining([
         expect.objectContaining({
             id: expect.any(Number),
             name: expect.any(String),
             image: expect.any(String),
             createdAt: expect.any(String),
             updatedAt: expect.any(String)
         })
       ]));
     })
 })

 describe("GET /hotels", () => {
     it("should respond with status 401 if no token is given", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();
        
         const response = await server.get("/hotels/"+hotel.id);
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
     });

     it("should respond with status 401 if given token is not valid", async () => {
         const token = faker.lorem.word();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();
    
         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
     });

     it("should respond with status 401 if there is no session for given token", async () => {
         const userWithoutSession = await createUser();
         const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
         await createEnrollmentWithAddress(userWithoutSession);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);
    
         expect(response.status).toBe(httpStatus.UNAUTHORIZED);
       });
 })

describe("when token is valid", () => {
     it("should respond with status 404 if thisn't a enrollment for user", async () => {
         const token = await generateValidToken();

         await createHotel();
         const hotel = await prisma.hotel.findFirst();
         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.NOT_FOUND);
     })

     it("should respond with status 404 if thisn't a ticket for user", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createHotel();
         const hotel = await prisma.hotel.findFirst();

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.NOT_FOUND);
     })

     it("should respond with status 402 if the ticket isn't paid", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 402 if the ticket is remote", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createRemoteTicketType();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 402 if the ticket hasn't hotel", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithoutHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

     it("should respond with status 402 if the hotel doesn't exist", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithoutHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "RESERVED");
         const fakeId = Math.floor(Math.random()*1000);

         const response = await server.get("/hotels/"+fakeId).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
     })

    it("should respond with status 200, with the hotel data and a empty array for the rooms data when the hotel hasn't any room", async () => {
        const token = await generateValidToken();
        const user = await prisma.user.findFirst();
        await createEnrollmentWithAddress(user);
        await createTicketTypeWithHotel();
        const userInfos = await getParamsId();
        await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
        await createHotel();
        const hotel = await prisma.hotel.findFirst();

        const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        }))
        expect(response.body.Rooms).toEqual([]);
    })
     it("should respond with status 200, with the data of the hotel and rooms when the hotel has a room", async () => {
         const token = await generateValidToken();
         const user = await prisma.user.findFirst();
         await createEnrollmentWithAddress(user);
         await createTicketTypeWithHotel();
         const userInfos = await getParamsId();
         await createTicket(userInfos.enrollmentId, userInfos.ticketTypeId, "PAID");
         await createHotel();
         const hotel = await prisma.hotel.findFirst();
         await createRooms(hotel.id);

         const response = await server.get("/hotels/"+hotel.id).set("Authorization", `Bearer ${token}`);

         expect(response.status).toBe(httpStatus.OK);
         expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            Rooms: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    capacity: expect.any(Number),
                    hotelId: expect.any(Number),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                })
            ])
        }));
     })
})