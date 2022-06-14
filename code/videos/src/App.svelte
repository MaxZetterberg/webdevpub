<script>
  import { video_player_is_active } from "./stores.js";
  import { Button, Overlay } from "svelte-materialify";
  import { videos } from "./videos.js";
  import Player from "./Player.svelte";
  import Thumbnail from "./Thumbnail.svelte";

  let is_fullscreen = false;
  let videoId;
</script>

<main>
  <div id="top">
    <img
      class="cock"
      src="Masterchef.png"
      alt="cock"
      height="100px"
    />
    <h1 id="title">Mastercock</h1>
  </div>

  <h3 id="popular">popular</h3>
  <div class="grid">
    {#each Array(6) as _, i}
      <!-- Probably here you want to show different videos than I have selected -->
      <Thumbnail video={videos.Pop[i % 6]} />
    {/each}
  </div>
  <h3 id="recommended">recommended for you</h3>
  <div class="grid">
    {#each Array(6) as _, i}
      <!-- Probably here you want to show different videos than I have selected -->
      <Thumbnail video={videos.Rec[i % 6]} />
    {/each}
  </div>
  <Overlay
    opacity={is_fullscreen ? 1 : 0.7}
    color="black"
    active={$video_player_is_active}
    on:click={() => {
      $video_player_is_active = false;
    }}
  >
    <div
      id="video"
      class:fullscreen={is_fullscreen == true}
      on:click={(e) => {
        e.stopPropagation();
      }}
    >
      <div id="close">
        <Button
          class="error-color"
          size="small"
          on:click={() => {
            $video_player_is_active = false;
          }}
        >
          Close
        </Button>
      </div>
      <div id="fullscreen">
        <Button
          size="small"
          class="primary-color"
          on:click={() => {
            is_fullscreen = !is_fullscreen;
            // do not focus the fullscreenbutton if clicked
            // this is because otherwise clicking space will cause
            // the video player to maximize/minimize instead of pause/play
            // when space is clicked
            if (document.activeElement != document.body)
              document.activeElement.blur();
          }}
        >
          {is_fullscreen ? "Minimize" : "Theatre Mode"}
        </Button>
      </div>

      {#if is_fullscreen}
        <div id="gigascreen">
          <Button
            size="small"
            class="secondary-color"
            on:click={() => {
              // do not focus the fullscreenbutton if clicked
              // this is because otherwise clicking space will cause
              // the video player to maximize/minimize instead of pause/play
              // when space is clicked
              if (document.activeElement != document.body)
                document.activeElement.blur();

              let div = document.getElementById("vid");
              if (div.requestFullscreen) div.requestFullscreen();
              else if (div.webkitRequestFullscreen)
                div.webkitRequestFullscreen();
              else if (div.msRequestFullScreen) div.msRequestFullScreen();
            }}
          >
            {"Gigascreen"}
          </Button>
        </div>
      {/if}
      <Player />
    </div>
  </Overlay>

  <src />
</main>

<style>
  :global(:root) {
    --netflix-red: rgb(255, 102, 0);
    --netflix-red-opacity: rgba(17, 5, 5, 0.3);
  }

  :global(body) {
    padding: 0;
    margin: 0;
    height: 100vh;
    width: 100vw;
  }

  main {
    width: 100vw;
    background: rgb(0, 0, 0);
    background-size: 2600%;
    padding-left: 5%;
    padding-right: 5%;
    box-sizing: border-box;
  }

  #video {
    position: fixed;
    transition: all 0.3s ease-out;
    left: 15%;
    right: 15%;
    top: 15%;
    bottom: 15%;
  }

  #video.fullscreen {
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
  }

  #video.fullscreen #gigascreen {
    position: absolute;
    top: 10px; /* position the top  edge of the element at the middle of the parent */
    left: 50%; /* position the left edge of the element at the middle of the parent */

    transform: translate(-50%, 0);
    z-index: 100;
  }
  #video #close {
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 100;
  }

  #video #fullscreen {
    position: absolute;
    top: -10px;
    left: -10px;
    z-index: 100;
  }

  #video.fullscreen #close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }

  #video.fullscreen #fullscreen {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
  }

  .grid {
    display: grid;
    grid-row-gap: 50px;
    grid-column-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(225px, auto));
    padding: 10px;
  }

  #title {
    color: var(--netflix-red);
    font-size: 62px;
    line-height: 100px;
  }

  #top {
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgb(0, 0, 0);
    background-size: 2600%;
    height: 100px;
    padding-left: calc(5% + 5px);
  }

  #popular {
    margin-top: 100px;
  }
  h3 {
    margin: 0;
    color: rgb(255, 102, 0);
    font-size: 3em;
  }
  /* #bollar{
    padding-top: 100px;
  } */
  @media only screen and (max-width: 600px) {
    #title {
      font-size: 40px;
    }

    .cock {
      width: 50px;
      height: 50px;
    }
  }
</style>
