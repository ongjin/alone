<script>
    import Test from "./../+page.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
    console.log('data', data);

    let currentPage = data.page.pageNo
    let total = data.result.total
    let skip = data.result.skip
    let limit = data.result.limit

</script>

<Test bind:data/>
