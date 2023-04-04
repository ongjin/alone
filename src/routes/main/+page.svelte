<script>
    import Header from "$com/component/Header.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<Header bind:data/>

<div>{JSON.stringify(data)}</div>