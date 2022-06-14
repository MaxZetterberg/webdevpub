<script>
    export let json;
    import { fly, fade, slide, draw } from "svelte/transition";
</script>



{#if json && "data" in json && "items" in json.data && json.data.items.length > 0}
    <div id = "item-holder">
        {#each json.data.items as item}
            <div id = "item">
                <h4>
                    {item.url}
                </h4>
                
                <h1>
                    {item.name}
                </h1>
                <h2>
                    {item.description}
                </h2>
                <h3>
                    Published: {item.published_at}
                </h3>
                <!-- {#each Object.entries(item) as [key, value]}
                    <p in:fade>{JSON.stringify(value)}{JSON.stringify(key)}</p>
                {/each} -->
            </div>
        {/each}
    </div>
{:else if json}
    <div>
        <p in:fade>Error</p>
    </div>
{/if}

<style>
    #item-holder {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
        overflow-y: scroll;
        box-sizing: border-box;
        padding-left: 10%;
        padding-right: 10%;
        max-width: 100%;
        row-gap: 20px;
    }

    #item {
        border-radius: 25px;
        background-color: rgb(101, 5, 219);
        border: 2px solid rgb(101, 5, 219);
        padding: 20px;
        width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
    }

    h2 { 
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden
    }


    h3 {
        width: 198px;
        white-space: nowrap;
        overflow: hidden;
    }


    p {
        text-align: center;
        font-size: 35px;
        color: rgb(101, 5, 219);
        font-family: 'Noto Sans JP', sans-serif;
        border-style: dashed;
        border: 4px solid;
        border-image: linear-gradient(-45deg, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);
        animation: gradient 10s infinite ease;
        border-image-slice: 1 fill;
        height: 100px;
        margin: 20px auto;
        width: 200px;
        padding: 20px;
    }

    /** https://onaircode.com/html-css-custom-scrollbar-examples/ */
    ::-webkit-scrollbar {
        width: 15px;
        height: 15px;
    }
    ::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color: rgba(14, 18, 255, 0.1);
    }
    ::-webkit-scrollbar-thumb {
        background-image: linear-gradient(45deg, #1226DA, #9B04FB);
        border-radius: 10px;
        -webkit-box-shadow: rgba(0, 0, 0, 0.12) 0 3px 13px 1px;
    }
    @media screen and (max-width: 1642px) {
        #item{
            margin-top: 5%;
        }
    }
    @media screen and (max-width: 1271px) {
        #item{
            margin-top: 10%;
        }
    }
    @media screen and (max-width: 1030px) {
        #item{
            margin-top: 15%;
        }
    }
    @media screen and (max-width: 627px) {
        #item{
            margin-top: 20%;
        }
    }
    @media screen and (max-width: 545px) {
        #item{
            margin-top: 25%;
        }
    }
    @media screen and (max-width: 479px) {
        #item{
            margin-top: 30%;
        }
    }
    @media screen and (max-width: 429px) {
        #item{
            margin-top: 35%;
        }
    }
    @media screen and (max-width: 389px) {
        #item{
            margin-top: 40%;
        }
    }
</style>