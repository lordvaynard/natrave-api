import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient()

export const create = async (ctx) => {

    if (!ctx.headers.authorization){
        ctx.status = 401
        return
    }
    const [type, token] = ctx.headers.authorization.split(" ")
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
 
        if(!ctx.request.body.homeScore && !ctx.request.body.awayScore) {
            ctx.status = 400
            console.log(error)
            return
        }
        
            const userId = data.sub
            const { gameId } = ctx.request.body
            const homeScore = parseInt(ctx.request.body.homeScore)
            const awayScore = parseInt(ctx.request.body.awayScore)
            
            try{
            const [tip] = await prisma.tip.findMany({
                where: {userId,gameId},
            })

            ctx.body =tip
                ? await prisma.tip.update({
                    where: {
                        id: tip.id
                    },
                    data: {
                        homeScore,
                        awayScore
                    }
                })
                : await prisma.tip.create ({
                        data: {
                        gameId, 
                        userId, 
                        homeScore, 
                        awayScore
                        }
                    })

            } catch (error){
                console.log(error)
                ctx.body = error
                ctx.status = 500
            }

    } catch(error){
        ctx.status = 401
        return
    }

}
    
