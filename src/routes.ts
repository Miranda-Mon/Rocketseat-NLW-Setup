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


    app.patch('/habits/:id/toggle', async (request) => {
        const toggleHabitParams = z.object({
            id: z.string().uuid()
        })

        const { id } = toggleHabitParams.parse(request.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today
            }
        })

        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        })

        if (dayHabit) {
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id
                }
            })
        } else {
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id
                }
            })
        }
    })

    app.get('/summary', async () => {
        const summary = await prisma.$queryRaw`
          SELECT 
            D.id, 
            D.date,
            (
              SELECT 
                cast(count(*) as float)
              FROM day_habits DH
              WHERE DH.day_id = D.id
            ) as completed,
            (
              SELECT
                cast(count(*) as float)
              FROM habit_week_days HDW
              JOIN habits H
                ON H.id = HDW.habit_id
              WHERE
                HDW.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                AND H.created_at <= D.date
            ) as amount
          FROM days D
        `

        return summary
    })

}
