<!-- strukturera avstånd mellan element och få det att se bra ut på Iphone SE -->
<script>
	import { bind } from "svelte/internal";
	import {fly, fade, slide, draw} from "svelte/transition";
	import {spring} from "svelte/motion";
	import { Clock } from "./Clock";
	let klocka = new Clock(12, 57);
	let minutes = spring();
	let hours = spring();
	$minutes=parseInt(klocka.time.hour) *60 + parseInt(klocka.time.minute);
	$hours=parseInt(klocka.time.hour);
	let i = 0;
	function tick(){
		klocka.tick();
		klocka = klocka;
		i++;
		if(klocka.time.hour + klocka.time.minute ==0){
			hours = spring();
			minutes = spring();
			$minutes=parseInt(klocka.time.hour) *60 + parseInt(klocka.time.minute);
			$hours=parseInt(klocka.time.hour);			
		}else{
			hours.set(parseInt(klocka.time.hour));
			minutes.set(parseInt(klocka.time.hour) *60 + parseInt(klocka.time.minute));
		}
	}
	setInterval(tick, 1000);

	
</script>

<body>
<div class="grid-container">	
	<div class="column">
		<cir>
		<svg viewBox="-50 -50 100 100">
    		<circle class="clock-face" r="48" />

			<!-- markers -->
			{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
				<line class="major" y1="40" y2="45" transform="rotate({30 * minute})" />

				{#each [1, 2, 3, 4] as offset}
					<line
						class="minor"
						y1="42"
						y2="45"
						transform="rotate({6 * (minute + offset)})"
					/>
				{/each}
			{/each}

			<!-- hour hand -->
			<line
				class="hour"
				y1="33"
				y2="38"
				transform="rotate({(6 / 12) * $minutes - 180})"
			/>

			<!-- minute hand -->
			<g transform="rotate({6 * $minutes - 180})">
				<line class="minute" y1="30" y2="38" />
			</g>
			
		</svg>
	</cir>
		</div>


		<div class="column">
	
			<h3>
				{#if klocka.alarmIsTrigger == true}
					Vakna!!!
				{:else}
					Alarm: {klocka.alarmTime}
				{/if}
			</h3>
		
			<div>
				{#key klocka.time.hour}
					<span in:fly={{ y: -20 }}>
						{klocka.time.hour.toString().padStart(2, "0")}
					</span>
				{/key}
				<span> : </span>
				{#key klocka.time.minute}
					<span in:fly={{ y: -20 }}>
						{klocka.time.minute.toString().padStart(2, "0")}
					</span>
				{/key}
		
			<div><button on:click={() => (klocka.toggleAlarm())} class="button-3d" id="C-button2">toggleAlarm</button>
				<input type="time" bind:value={klocka.alarmFromString}></div> 
			<p id="time"/>
			<p id="alarm"/>
		
			<!-- <button on:click={tick} class="button-3d" id="C-button2">1+Sec</button> -->
			</div>
			</div>


		<div class="column">
			<rec>
				<svg width="20" height="10">
					<rect width="100%" height="100%" style="fill:rgb(79,79,79);stroke-height:1;stroke:rgb(0,0,0)" />
					<rect width="{(klocka.time.minute/60) * 100}%" height="50%" style="fill.rgb(0,0,0);stroke-height:1;stroke:rgb(0,0,0)"  />
					<rect width="{(klocka.time.minute/60 + klocka.time.hour/24 * 100)}%" height="50%" y="50%" style="fill.rgb(0,0,0);stroke-height:1;stroke:rgb(0,0,0)" />
				</svg>
			</rec>
			
		</div>


			<p id="time"/>

			<p id="alarm"/>

			<p id="test"/>
		
	

	<p class="tjenix">
		
	</p>
</div>
</body>

<style>
	:global(body){
		
		background: linear-gradient(45deg, #301934, #FFB6C1);
		background-size: 2600% 100%;

		animation: gradient 5s linear infinite;
		align-items: center;
		align-content: center;
		justify-content: center;
		padding: 0;
		margin:0;
		width: 100%;
		height: 100%;
		flex-direction: row;
		column-gap: 50px;
	}

	.grid-container{
		
		display: grid;
		grid-template-columns: auto auto auto;
		grid-gap: 1em;
		padding: 1em;
		margin: 1em;
	}

	.grid-container>div{
		/* background-color: #841D82; */
		background-color: rgba(132, 29, 130, 0.75);
		text-align: center;
		font-size: 2em;
		height: 100%;
		width: 100%;
		border-radius: 3%;
	}

	.column{

		justify-content: center;
		align-content: center;
		align-items: center;
		flex-direction: column;
		width: 100%;
		min-height: 100%;
		padding-top: 30px;
		
	}
	

	svg{
		width: 100%;
		height: 100%;
		
	}


	cir{
		height: 7em;
	}

	rec{
		height: 7em;
		width: 75%;
		
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
	
	body {
		color: rgb(228, 222, 222);
		background-color:#AAA ;
		text-align: center;
	}

	span {
		color: rgb(253, 255, 253);
		text-transform: uppercase;
		font-weight: bold;
		font-size: 2em;
	}


	.tjenix {
		font-size: 2em;
		color: rgb(242, 248, 244);
		text-align: center;
	}

	p {
		font-size: 1em;
		color: rgb(252, 250, 250);
		text-align: center;
		align-content: center;
		align-items: center;
		
	}

	#test {
		font-size: 2em;
		color: indianred;
	}
	
	.button-3d {
 	position:relative;
  	width: auto;
  	display:inline-block;
  	color:#000000;
  	text-decoration:none;
  	border-radius:100px;
  	border:solid 1px #797979;
  	background:#797979;
  	text-align:center;
  	padding:16px 18px 14px;
  	margin: 12px;
  
  	-webkit-transition: all 0.1s;
		-moz-transition: all 0.1s;
		transition: all 0.1s;
	
  	-webkit-box-shadow: 0px 6px 0px #797979;
  	-moz-box-shadow: 0px 6px 0px #797979;
  	box-shadow: 0px 6px 0px #757575;
	}

	.button-3d:active{
    	-webkit-box-shadow: 0px 2px 0px #000000;
    	-moz-box-shadow: 0px 2px 0px #000000;
    	box-shadow: 0px 2px 0px #000000;
    	position:relative;
    	top:4px;
	}

	#C-button2{
		border-radius: 100px;
	}

	svg {
        width: 50%;
        height: 50%;
    }
    .clock-face {
        stroke: #333;
        fill: none;
    }
    .minor {
        stroke: rgb(56, 56, 56);
        stroke-width: 0.4;
    }
    .major {
        stroke: #333;
        stroke-width: 0.8;
    }
    .minute {
        stroke: rgb(180, 0, 0);
        stroke-width: 1;
    }
    .hour {
        stroke: #333;
        stroke-width: 2;
    }

	@media only screen and (max-width: 850px){
		.grid-container{
			display: flex;
			flex-direction: column;
			column-gap: 1em;
			height: 60%;
			max-height: max-content;
			padding: 1em;
		}
		:global(body){
			background: #AAA;
		}
	}
</style>