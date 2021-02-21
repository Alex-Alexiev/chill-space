<template>
<div class="cont">
    <main class="form-signin">
  
    <center><img class="mb-4" :src="logo" alt="" width="30%" height="60%" style="width:60%; height 60%"></center>
    <h1 class="h3 mb-3 fw-normal text-center">Welcome to Chillspace!</h1>
    <label for="inputEmail" class="visually-hidden">Create a New Game:</label>
    <br>
    <center><img :src="voleyball" @click="changeGame('0')" id="game-0" style="opacity: 0.25;"> <img :src="soccer" @click="changeGame('1')" id="game-1" style="opacity: 1;"> <img :src="dance" @click="changeGame('2')" id="game-2" style="opacity: 1;"></center>
    <button v-on:click="createRoom" class="w-100 btn btn-lg btn-primary" style="margin-top:15px;">Create Room</button>
    <br>
    <label for="input" class="visually-hidden" style="margin-top: 15px;">Join an Existing Room:</label>
    <input type="text" id="input" class="form-control" placeholder="Game ID" v-model="room.id">
    <div class="checkbox mb-3">
    </div>
    <button v-on:click="joinRoom" class="w-100 btn btn-lg btn-primary">Join Room</button>
    
    <p class="mt-5 mb-3 text-muted"><a href="https://github.com/alex-alexiev" class="text-secondary">Alex Alexiev</a>, <a href="https://github.com/jslightham" class="text-secondary">Johnathon Slightham</a>, and <a href="https://github.com/lcarnegie" class="text-secondary">Luca Carnegie</a></p>
  
</main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      room: {},
      logo: require('@/assets/logo.jpg'),
      dance: require('@/assets/dance.jpg'),
      soccer: require('@/assets/soccer.jpg'),
      voleyball: require('@/assets/volleyball.jpg'),
      game: 0,
    };
  }, created() {
    this.setCookie("game", 0, 0);
  },
  methods: {
    createRoom() {
      this.axios.get("https://dance.cubehostingmc.com:4000/rooms/add").then((res) => {
        console.log("create");
        let id = res.data._id;
        let playerId = res.data.playerId;
        let playerColour = res.data.colour;
        this.setCookie("playerId", playerId, 1);
        this.setCookie("playerColour", playerColour, 1);
        this.setCookie("game", this.game, 1);
        console.log(res.data);
        this.$router.push({path: `game/${id}`});
      }).catch(e => {console.log(e)});
    },
    joinRoom() {
      console.log(this.room);
      this.axios.post("https://dance.cubehostingmc.com:4000/rooms/join", this.room).then((res) => {
        if (res.data){
          console.log(res.data);
          let playerId = res.data._id;
          let playerColour = res.data.colour;
          this.setCookie("playerId", playerId, 1);
          this.setCookie("playerColour", playerColour, 1);
          console.log(res.data);
          this.$router.push({path: `game/${this.room.id}`});
        } else {
          alert("Please enter a valid room!");
        }
      });
    },
    setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    changeGame(game) {
      this.game = game;
      this.setCookie("game", game, 1);
      if (game == '0') {
        document.getElementById('game-0').style.opacity = "0.25";
        document.getElementById('game-1').style.opacity = "1";
        document.getElementById('game-2').style.opacity = "1";
      }
      if (game == '1') {
        document.getElementById('game-0').style.opacity = "1";
        document.getElementById('game-1').style.opacity = "0.25";
        document.getElementById('game-2').style.opacity = "1";
      }
      if (game == '2') {
        document.getElementById('game-0').style.opacity = "1";
        document.getElementById('game-1').style.opacity = "1";
        document.getElementById('game-2').style.opacity = "0.25";
      }
    }
  },
};
</script>

<style scoped>
.cont {
  display: flex;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
  height: 100vh;
  width: 100vw;
}

.form-signin {
  width: 100%;
  max-width: 500px;
  padding: 15px;
  margin: auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      @media (min-width: 768px) {
        .bd-placeholder-img-lg {
          font-size: 3.5rem;
        }
      }
</style>
