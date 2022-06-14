<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100&display=swap" rel="stylesheet"> 
<script>
    import Spinner from "./Spinner.svelte";
    import Results from "./Results.svelte";
    import Search from "./Search.svelte";
    import { promise } from "./stores.js";

</script>

<main>


    <Search/>

    {#await $promise}
        <Spinner />
    {:then result}
        <Results json={result} />
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</main>

<style>
    :global(body) {
        padding: 0;
        margin: 0;
    }

    main {
        height: 100vh;
        width: 100vw;
        background: linear-gradient(
            -45deg,
            #656160,
            #484443,
            #272525,
            #060505
        );
        background-size: 400% 400%;
		/* background-color: rgb(0, 155, 119); */
        animation: gradient 10s ease infinite;
		height: 100vh;
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        gap: 50px;
        padding-top: 10%;
        padding-left: 10%;
        padding-right: 10%;
        box-sizing: border-box;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>

