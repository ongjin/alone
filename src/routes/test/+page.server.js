import { fail, redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

import dbConfig from '$lib/oracle/config'
import { json } from '@sveltejs/kit'
import oracledb from 'oracledb'
import bcrypt from 'bcryptjs';

import { selectDB, transactionDB } from '$lib/oracle/oracle'
import { finalTokenCheck } from '$lib/services/token'

/** @type {import('./$types').PageLoad} */
export async function load(event) {
    const tokenResult = await finalTokenCheck(event)

    return { flag: true }

}