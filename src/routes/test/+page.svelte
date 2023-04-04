<script>
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";

    export let data;
    console.log("data", data);

    /** 전체 게시글 수 */
    const total = data.result.total; // == 150
    const max = 10; // 10개씩 뽑음
    const pagenationCount = total / max; // == 15

    // 최대 몇 페이지?
    const loadPage = 5;

    const currentPage = data.page.pageNo;
    /** 첫 페이지 1 2 3 4 5 기준 3선택 시 첫 페이지는 1 / 4 선택 시 첫 페이지는 2 / 2 3 4 5 6 */
    let prePage = currentPage < 4 ? 1 : currentPage - 2;
    let lastPage =
        prePage == 1
            ? loadPage
            : prePage + loadPage > pagenationCount
            ? pagenationCount
            : Number(currentPage) + 2;

    prePage = lastPage == pagenationCount ? pagenationCount - 4 : prePage;

    console.log(prePage, lastPage);

    let skip = data.result.skip;
    let limit = data.result.limit;

    const goPage = (url) => {
        location.href = url;
        goto(url);
    };
</script>

<!-- // id: 1,
// title: 'His mother had always taught him',
// body: "His mother had always taught him not to ever think of himself as better than others. He'd tried to live by this motto. He never looked down on those who were less fortunate or who had less money than him. But the stupidity of the group of people he was talking to made him change his mind.",
// userId: 9,
// tags: [ 'history', 'american', 'crime' ],
// reactions: 2 -->
<table>
    <thead>
        <tr>
            <td>id</td>
            <td>title</td>
            <td>userId</td>
            <td>tags</td>
        </tr>
    </thead>
    <tbody>
        {#each data.result.posts as item}
            <tr>
                <td>{item.id}</td>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <td on:click={() => goPage(`/testDetail/${item.id}`)}
                    >{item.title}</td
                >
                <td>{item.userId}</td>
                <td>{item.tags}</td>
            </tr>
        {/each}
    </tbody>
</table>

<div id="pagenation">
    <p>◀</p>
    {#each Array(5) as val, idx}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p
            on:click={() => {
                goPage(`/test/${prePage + idx}`);
            }}
            style="{currentPage == prePage + idx ? 'text-decoration: underline;' : ''}"
        >
            {prePage + idx}
        </p>
    {/each}
    <p>▶</p>
</div>

<style>
    table {
        width: 100%;
        margin: 2rem;
        font-size: 1.5rem;
    }
    table td {
        border: 1px solid #ccc;
    }
    thead td {
        font-weight: bold;
    }
    tbody td:nth-child(2) {
        cursor: pointer;
    }
    #pagenation {
        width: 100%;
        text-align: center;
    }
    #pagenation > p {
        display: inline-block;
        margin: auto;
        cursor: pointer;
        font-weight: bold;
        font-size: 1.5rem;
    }
</style>
