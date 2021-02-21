import Vue from 'vue'
import App from './App.vue'
import './assets/reset.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import VueRouter from 'vue-router';
Vue.use(VueRouter);

import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

import Home from './components/Home.vue';
import Game from './components/Game.vue';

const routes = [
  {
      name: 'home',
      path: '/',
      component: Home
  },
  {
    name: 'game',
    path: '/game/:id',
    component: Game
  }
];

const router = new VueRouter({ mode: 'history', routes: routes});

new Vue(Vue.util.extend({ router }, App)).$mount('#app');