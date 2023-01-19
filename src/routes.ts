import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {

    app.post("/habits", async (req, res) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6))
        })
        const { title, weekDays } = createHabitBody.parse(req.body)
        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: new Date(),
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay
                        }
                    })
                }

            }
        })
    })


    app.get("/day", async (req, res) => {
        const getDayParam = z.object({
            date: z.coerce.date() // devolve a data em string
        })

        const { date } = getDayParam.parse(req.query)
        const weekDay = dayjs(date).get('day')
        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: { //pelo menos 1 deverá devolver
                        week_day: weekDay
                    }
                }
            }
        })
        const day = prisma.day.findUnique({
            where: {
                date
            },
            include: {
                dayHabits: true
            }
        })
        const completedHabits = day?.dayHabits
        return res.status(200).send({ possibleHabits, completedHabits })



    })



}
