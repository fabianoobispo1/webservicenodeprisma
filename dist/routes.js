"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("./lib/prisma");
const dayjs_1 = __importDefault(require("dayjs"));
async function appRoutes(app) {
    app.post('/habits', async (request) => {
        const createHabitBody = zod_1.z.object({
            title: zod_1.z.string(),
            weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6))
        });
        const { title, weekDays } = createHabitBody.parse(request.body);
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        await prisma_1.prisma.habit.create({
            data: {
                title,
                created_ad: today,
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay
                        };
                    })
                }
            }
        });
    });
    app.get('/day', async (request) => {
        const getDayParams = zod_1.z.object({
            date: zod_1.z.coerce.date()
        });
        const { date } = getDayParams.parse(request.query);
        const parseDate = (0, dayjs_1.default)(date).startOf('day');
        const weekday = parseDate.get('day');
        const posiblehabts = await prisma_1.prisma.habit.findMany({
            where: {
                created_ad: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekday,
                    }
                }
            }
        });
        const day = await prisma_1.prisma.day.findUnique({
            where: {
                date: parseDate.toDate()
            },
            include: {
                dayHabits: true
            }
        });
        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id;
        }) ?? [];
        return { posiblehabts, completedHabits };
    });
    app.patch('/habits/:id/toggle', async (request) => {
        const toggleHabitParams = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const { id } = toggleHabitParams.parse(request.params);
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        let day = await prisma_1.prisma.day.findUnique({
            where: {
                date: today,
            }
        });
        if (!day) {
            day = await prisma_1.prisma.day.create({
                data: {
                    date: today
                }
            });
        }
        const dayHabit = await prisma_1.prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        });
        if (dayHabit) {
            //remover a marcacao de completo
            await prisma_1.prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                }
            });
        }
        else {
            //cmpletar o habito
            await prisma_1.prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id
                }
            });
        }
    });
    app.get('/summary', async () => {
        const summary = await prisma_1.prisma.$queryRaw `
            SELECT 
                D.id, 
                D.date,
                (
                    SELECT
                        cast(count(*) as float) 
                    FROM day_habits DH
                    where DH.day_id = D.id
                ) as completed,
                (
                    SELECT
                        cast(count(*) as float) 
                    FROM habit_week_days HWD
                    JOIN habits H
                        on H.id = HWD.habit_id
                    where 
                        HWD.week_day = cast( strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        and H.created_ad <= D.date
                ) as amount                
            FROM days D

        `;
        return summary;
    });
    app.post('/CreateExercise', async (request) => {
        const createExerciseBody = zod_1.z.object({
            title: zod_1.z.string(),
            repetition: zod_1.z.number(),
            charge: zod_1.z.number(),
            video_link: zod_1.z.string(),
            description: zod_1.z.string(),
            weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6))
        });
        const { title, repetition, charge, video_link, description, weekDays } = createExerciseBody.parse(request.body);
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        const video = video_link.split('=');
        const test = video[1];
        return title;
        await prisma_1.prisma.exercise.create({
            data: {
                title,
                repetition,
                charge,
                video_link: video[1],
                description,
                created_ad: today,
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay
                        };
                    })
                }
            }
        });
    });
    app.get('/summaryExercise', async () => {
        const summary = await prisma_1.prisma.$queryRaw `
            SELECT 
                D.id, 
                D.exercise_id,
                D.week_day,                
                (
                    SELECT
                        title
                    FROM exercises E
                    where E.id = D.exercise_id
                ) as title,
                (
                    SELECT
                        repetition
                    FROM exercises E
                    where E.id = D.exercise_id
                ) as repetition,   
                (
                    SELECT
                        charge
                    FROM exercises E
                    where E.id = D.exercise_id
                ) as charge,
                (
                    SELECT
                        video_link
                    FROM exercises E
                    where E.id = D.exercise_id
                ) as video_link,
                (
                    SELECT
                        description
                    FROM exercises E
                    where E.id = D.exercise_id
                ) as description
                      
            FROM exercise_week_days D
            Order by D.week_day

        `;
        return summary;
    });
    app.get('/exercise/:id', async (request) => {
        const exerciseBody = zod_1.z.object({
            id: zod_1.z.string()
        });
        const { id } = exerciseBody.parse(request.params);
        const response = prisma_1.prisma.exercise.findUnique({
            where: {
                id: id,
            }
        });
        return response;
    });
    app.post('/removeExercise', async (request) => {
        const exerciseBody = zod_1.z.object({
            exercise_id: zod_1.z.string()
        });
        const { exercise_id } = exerciseBody.parse(request.body);
        const response = prisma_1.prisma.exercise.delete({
            where: {
                id: exercise_id,
            }
        });
        return response;
    });
}
exports.appRoutes = appRoutes;
/*
model Exercise {
    id String @id @default(uuid())
  
    created_ad  DateTime
    title       String
    repetition  Int
    charge      Int
    video_link  String
    description String
    WeekDays    ExerciseWeekDays[]
  
    @@map("exercise")
  }
  
  model ExerciseWeekDays {
    id          String @id @default(uuid())
    exercise_id String
    week_day    Int
  
    exercise Exercise @relation(fields: [exercise_id], references: [id])
  
    @@unique([exercise_id, week_day])
    @@map("exercise_week_days")
  }
   */ 
