import { redirect } from '@sveltejs/kit'



/** @type {import('./$types').PageLoad} */
export async function load(event) {
    event.cookies.set('refreshToken', "", { maxAge: 0 })
    event.cookies.set('accessToken', "", { maxAge: 0 })

    throw redirect(301, '/main')
    return {flag: true}

}