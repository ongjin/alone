import { fail, redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

import oracledb from 'oracledb'
import bcrypt from 'bcryptjs';

import { selectDB, transactionDB } from '$lib/oracle/oracle'

import { getToken, finalTokenCheck } from '$lib/services/token'
// import Token from '$lib/services/token'

/** @type {import('./$types').PageLoad} */
export async function load(event) {
    /** GET: accessToken */
    const accessToken = event.cookies.get('accessToken')

    /** accessToken verify */
    const mainTokenResult = await finalTokenCheck(event)
    if(mainTokenResult?.status === 400){
        return mainTokenResult.data
    }

    return mainTokenResult

}

const refreshTokenOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
}
const accessTokenOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
}


/** @type {import('./$types').Actions} */
export const actions = {
    Login: async (event) => {
        const formData = await event.request.formData()
        const jsonData = Object.fromEntries(formData)
        const userId = jsonData.id
        const userPw = jsonData.password

        const uuid = crypto.randomUUID();

        /** 입력된 정보가 넘어왔는지 체크 */
        if (!userId || !userPw || typeof userId !== 'string' || typeof userPw !== 'string') {
            return fail(400, { invalid: true })
        }

        // 유저 DB select 객체
        const userCount = {
            query: `
                SELECT USER_NO, PASSWORD, USER_NAME, EMAIL
                FROM USERS
                WHERE USER_ID = :userId
            `,
            binds: {
                userId: { dir: oracledb.BIND_IN, val: userId, type: oracledb.STRING }
            }
        }

        /** 유저 DB select 객체 결과 */
        const userCountResponse = await selectDB(userCount)

        /** 유저 DB 조회 후 정보 없으면 리턴 */
        if (userCountResponse?.length === 0) return fail(400, { user: true })

        /** 쿼리 불러온 정보 변수에 저장 */
        const { USER_NO, PASSWORD, USER_NAME, EMAIL } = userCountResponse[0]

        /** bcrypt 암호화 */
        if (!bcrypt.compareSync(userPw, PASSWORD)) return fail(400, { password: true })

        /** refresh_token 발급 */
        const refreshToken = jwt.sign({
            uuid
        }, process.env.JWT_SECRET_KET, {
            expiresIn: '30d', // 만료시간
            issuer: 'astems'  // 발행자
        });

        /** 토큰 DB merge 객체 */
        const updateToken = {
            query: `
                MERGE INTO TOKEN 
                USING DUAL
                ON (USER_NO = :userNo)
                WHEN MATCHED THEN
                    UPDATE SET 
                    REFRESH_TOKEN = :refreshToken
                WHEN NOT MATCHED THEN
                    INSERT (REFRESH_TOKEN, USER_NO)
                    VALUES (:refreshToken, :userNo)
            `,
            binds: {
                refreshToken: { dir: oracledb.BIND_IN, val: refreshToken, type: oracledb.STRING },
                userNo: { dir: oracledb.BIND_IN, val: USER_NO, type: oracledb.NUMBER }
            }
        }

        /** 토큰 DB merge 객체 결과 */
        const updateTokenResponse = await transactionDB(updateToken)
        const { rowsAffected, lastRowid } = updateTokenResponse

        /** updateTokenResponse 에러가 발생하거나 업데이트 혹은 인설트된 행이 없을 시 에러 */
        if (rowsAffected === 0 || !rowsAffected) return fail(400, { credentials: true })

        /** access_token 발급 */
        const accessToken = jwt.sign({
            type: 'JWT',
            clientAddress: event.getClientAddress(),
            uuid,
            userNo: USER_NO,
            userName: USER_NAME,
            userEmail: EMAIL
        }, process.env.JWT_SECRET_KET, {
            expiresIn: '30m', // 만료시간
            issuer: 'astems'  // 발행자
        });

        event.cookies.set('refreshToken', refreshToken, refreshTokenOptions)
        event.cookies.set('accessToken', accessToken, accessTokenOptions)


        throw redirect(301, '/main')
    },
    Logout: async (event) => {
        throw redirect(301, '/logout')
    }


};

