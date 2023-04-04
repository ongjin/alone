import dbConfig from '$lib/oracle/config'
import { json } from '@sveltejs/kit'
import oracledb from 'oracledb'
import { finalTokenCheck } from '$lib/services/token'

import { selectDB, transactionDB } from '$lib/oracle/oracle'


/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
    // const params = await event.params

    const mainTokenResult = await finalTokenCheck(event)
    console.log('mainTokenResult', mainTokenResult);

    if (mainTokenResult?.status === 400) {
        return json(mainTokenResult.data)
    }

    const object = {
        query: `
            select 
                USER_NO, 
                USER_ID, 
                EMAIL, 
                PASSWORD, 
                USER_ADDR1, 
                USER_ADDR2, 
                USER_POST, 
                USER_PHONE, 
                USER_LEVEL,
                USER_JDATA
            from users
        `,
        binds: {
            // msNo: { dir: oracledb.BIND_IN, val: params.msNo, type: oracledb.STRING }
        },
        options: { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true }
    }

    const response = await selectDB(object)

    return json(response)
}