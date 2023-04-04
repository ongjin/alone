/**
 * GET일때
 */
/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const params = await event.params

    // const response = await fetch('https://dummyjson.com/products/99')
    // const response = await fetch('https://jsonplaceholder.typicode.com/todos')
    const response = await fetch('https://dummyjson.com/posts/1')
        .then(response => response.json())
        .then(console.log)

    // console.log('response', response);

    return params
}


// https://dummyjson.com/posts?limit=10&skip=0