<script>
    import { promise } from "./stores.js";
    let question;
    let beforeSearch = true;
    async function search() {
        const res = await fetch(
            `https://demo.dataverse.org/api/search?q=` + question
        );
        const json = await res.json();

         if (res.ok) {
            return beforeSearch = false, json;
        } else {
            throw new Error(json);
        } 
    }
</script>

<p class="searchlogo" style="top: {beforeSearch ? '30%' : '0%'}">Ebalo</p> 


<div>
    <form
        on:submit|preventDefault={() => {
            $promise = search();
        }}
    >  
    <input bind:value={question} placeholder="Search..." style="top: {beforeSearch ? '50%' : '20%'}" class="search"/>
    </form>
</div>

<style>
    div {
        display: flex;
        gap: 10px;
        width: 50%;
        justify-self: center;
        align-items: center;
    }

    form,
    form input {
        width: 100%;
    }
    p{
        font-size: 35px;
        color: rgb(101, 5, 219);
        font-family: 'Noto Sans JP', sans-serif;
        border: 5px solid transparent;
        border-image: linear-gradient(-45deg, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);
        animation: gradient 10s infinite ease;
        border-image-slice: 5;
        height: 100px;
        margin: 20px auto;
        width: 200px;
    }
    .search {
        position: absolute;
        width: 40%;
    }
    .searchlogo {
        position: absolute;
        width: 200px;
        text-align: center;
    }

</style>