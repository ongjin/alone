<script>
    import Board from "./../+page.svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    let pageNo = data.pageNo
</script>

<Board bind:pageNo />
