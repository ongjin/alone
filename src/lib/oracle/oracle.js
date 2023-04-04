import { fail, redirect } from '@sveltejs/kit'
import { generatorToken, getCookieToken, setCookieToken } from '$lib/services/token'
import logger from '$lib/config/winstonConfig'

import jwt from 'jsonwebtoken'

import dbConfig from '$lib/oracle/config'
import { json } from '@sveltejs/kit'
import oracledb from 'oracledb'
import bcrypt from 'bcryptjs';

export const selectDB = async (Object) => {
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true }
    const connection = await oracledb.getConnection(dbConfig)

    let result
    try {
        result = (await connection.execute(Object.query, Object.binds, options))?.rows
        // logger.info('selectDB \n%o', Object)
    } catch (err) {
        throw err
    } finally {
        await connection.close()
    }

    return result
}

export const transactionDB = async (Object) => {
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT, batchErrors: true, autoCommit: false }
    const connection = await oracledb.getConnection(dbConfig)

    let result
    try {
        result = await connection.execute(Object.query, Object.binds, options)
        // logger.info('transactionDB \n%o', Object)
    } catch (err) {
        await connection.rollback()
        throw err
    } finally {
        await connection.commit()
        await connection.close()
    }

    return result
}