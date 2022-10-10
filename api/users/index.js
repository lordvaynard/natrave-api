import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const create = async (ctx) => {
    const saltRounds = 10
    const password = await bcrypt.hash(ctx.request.body.password, saltRounds)
    const data = {
        name: ctx.request.body.name,
        username: ctx.request.body.username,
        email: ctx.request.body.email,
        password,
    }

    try{
        const { password, ...user } = await prisma.user.create({data}) //Criando usuario no banco
        ctx.body = user
        ctx.status = 201

    } catch (error){ //se erro na criação, log e mensagem 502
        console.log(error)
        ctx.body = error
        ctx.status = 502
    }

    const [type, token] = ctx.headers.authorization.split(" ")//tratando a senha do usuario
    const decodedToken = atob(token)
    const [email, passwordTextPlain] = decodedToken.split(":")

    const user = await prisma.user.findUnique({ //Verificando seu usuario existe 
        where: {email}
    })

    if (!user) {
        ctx.status = 404
        return
    }

    const passwordMatch = await bcrypt.compare(passwordTextPlain, user.password) //Comparando a senha

    if (!passwordMatch) {
        ctx.status = 404
        return
    }

    const accessToken = jwt.sign({
        sub: ctx.body.id,
        name: ctx.body.name,
        expiresIn: "7d"
    }, process.env.JWT_SECRET)

    ctx.body = {
        user,
        accessToken
    }
    console.log(ctx.body)
}

export const login = async ctx => {
    const [type, token] = ctx.headers.authorization.split(" ")
    const decodedToken = atob(token)
    const [email, passwordTextPlain] = decodedToken.split(":")

    const user = await prisma.user.findUnique({
        where: {email}
    })

    if (!user) {
        ctx.status = 404
        return
    }

    const passwordMatch = await bcrypt.compare(passwordTextPlain, user.password)

    if (!passwordMatch) {
        ctx.status = 404
        return
    }

    const { password, ...result} = user

    const accessToken = jwt.sign({
        sub: user.id,
        name: user.name,
        expiresIn: "7d"
    }, process.env.JWT_SECRET)

    ctx.body = {
        user: result,
        accessToken
    }
}

export const tips = async ctx =>{
    const username = ctx.request.params.username

    const user = await prisma.user.findUnique({ //busca o usuario dos params na barra
        where: { username }
    })

    if (!user){ //se não encontrar o usuario gera erro 404
        ctx.status = 404
        return
    }


    const tips = await prisma.tip.findMany({
        where: {
            userId: user.id
        }
    })    
    
    ctx.body = {
        name: user.name,
        tips
    }
}