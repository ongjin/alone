import jwt from 'jsonwebtoken'
import logger from '$lib/config/winstonConfig'
import { fail, redirect, error } from '@sveltejs/kit'

import dbConfig from '$lib/oracle/config'
import oracledb from 'oracledb'
import bcrypt from 'bcryptjs';

import { selectDB, transactionDB } from '$lib/oracle/oracle'

// export default class Token {
//     #refreshToken
//     #accessToken

//     constructor(refreshToken, accessToken) {
//         this.#refreshToken = refreshToken
//         this.#accessToken = accessToken
//     }

//     set refreshToken(token) {
//         this.#refreshToken = token
//     }
//     get refreshToken() {
//         return this.#refreshToken
//     }

//     set accessToken(token) {
//         this.#accessToken = token
//     }
//     get accessToken() {
//         return this.#accessToken
//     }

//     toString(){
//         return {refreshToken: this.#refreshToken, accessToken: this.#accessToken}
//     }

//     verifyToken(token) {
//         try {
//             jwt.verify(token, process.env.JWT_SECRET_KET)
//             return true
//         } catch (err) {
//             return false
//         }
//     }

//     getToken(token) {
//         try {
//             return jwt.verify(token, process.env.JWT_SECRET_KET)
//         } catch (err) {
//             return err.name
//         }
//     }
// }

export const refreshTokenOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
}
export const accessTokenOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
}
export const zeroTokenOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
}

export const getToken = token => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KET)
    } catch (err) {
        return err.name
    }
}

export const verifyToken = token => {
    try {
        jwt.verify(token, process.env.JWT_SECRET_KET)
        return true
    } catch (err) {
        return false
    }
}


export const finalTokenCheck = async event => {
    const rToken = event.cookies.get('refreshToken')
    const aToken = event.cookies.get('accessToken')
    const uuid = crypto.randomUUID();

    try {
        if (verifyToken(rToken)) {
            /** refreshToken TRUE */
            const refreshToken = jwt.verify(rToken, process.env.JWT_SECRET_KET)

            if (verifyToken(aToken)) {
                /** refreshToken TRUE accessToken TRUE */
                const accessToken = jwt.verify(aToken, process.env.JWT_SECRET_KET)
                // throw redirect(301, '/logout')
                logger.info(`refreshToken TRUE / accessToken TRUE %o`, accessToken)
                /** 모든 토큰 유효함 */
                /** 로그인 유지 */
                const {userNo, userName, userEmail} = accessToken
                return {userNo, userName, userEmail, user: true}
            } else {
                /** refreshToken TRUE accessToken FALSE */
                /** refreshToken으로 accessToken 재발급 로직 진행 후 로그인 유지 */

                // 유저 DB select 객체
                const userCount = {
                    query: `
                        SELECT USER_NO, USER_NAME, EMAIL
                        FROM USERS
                        LEFT JOIN TOKEN USING(USER_NO)
                        WHERE REFRESH_TOKEN = :refreshToken
                    `,
                    binds: {
                        refreshToken: { dir: oracledb.BIND_IN, val: rToken, type: oracledb.STRING }
                    }
                }

                /** 유저 DB select 객체 결과 */
                const userCountResponse = (await selectDB(userCount))

                /** 유저 DB 조회 후 정보 없으면 리턴 */
                if (userCountResponse?.length === 0) return fail(400, { user: true })

                /** 쿼리 불러온 정보 변수에 저장 */
                const { USER_NO, USER_NAME, EMAIL } = userCountResponse[0]

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

                event.cookies.set('accessToken', accessToken, accessTokenOptions)

                logger.info('accessToken이 발급되었습니다.')

                return {userNo: USER_NO, userName: USER_NAME, userEmail: EMAIL, user: true}

            }
        } else {
            /** refreshToken FALSE */
            if (verifyToken(aToken)) {
                /** refreshToken FALSE accessToken TRUE */
                /** accessToken이 정상이므로 refreshToken 재발급 후 db 업데이트 */
                const accessToken = jwt.verify(aToken, process.env.JWT_SECRET_KET)

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
                        userNo: { dir: oracledb.BIND_IN, val: accessToken.userNo, type: oracledb.NUMBER }
                    }
                }

                /** 토큰 DB merge 객체 결과 */
                const updateTokenResponse = await transactionDB(updateToken)
                const { rowsAffected, lastRowid } = updateTokenResponse

                /** updateTokenResponse 에러가 발생하거나 업데이트 혹은 인설트된 행이 없을 시 에러 */
                if (rowsAffected === 0 || !rowsAffected) return fail(400, { credentials: true })

                event.cookies.set('refreshToken', refreshToken, refreshTokenOptions)

                logger.info('refreshToken이 발급되었습니다. %o', accessToken)

                const {userNo, userName, userEmail} = accessToken
                return {userNo, userName, userEmail, user: true}

            } else {
                /** refreshToken FALSE accessToken FALSE */
                /** 모든 토큰 유효하지 않음으로 재로그인 필요. 로그인 페이지로 이동. */
                return fail(400, {user: false})
                return {user: false}

                // throw redirect(301, '/logout')
            }
        }
    } catch (err) {
        logger.error('token error handlering %o', err)

        /** status가 301이고 redirect 에러일경우 바로 리다이렉션 */
        if (err.status && err.status === 301) {
            throw redirect(err.status, err.location)
        }


        // return {user: false}

        /** 에러 핸들링 */
        return fail(400, err)
    }

}