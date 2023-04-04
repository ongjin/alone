/**
 * GET일때
 */


/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const params = await event.params

    // const response = await fetch('https://dummyjson.com/products/99')
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos')

    const currentPage = params.pageNo - 1
    const limit = 10
    const skip = currentPage * 10

    // await event.fetch('https://dummyjson.com/posts/1').then(res => res.json()).then(console.log)
    
    const response = (await event.fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${skip}`)).json()

    return {
        result : response,
        page: {
            pageNo: params.pageNo
        }
    }
}


// https://dummyjson.com/posts?limit=10&skip=0