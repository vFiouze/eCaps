<script>
import Main from './components/Main.vue';
import { defineComponent, ref } from 'vue'
export default defineComponent({
  components: { Main },
  setup() {
    const percentage=ref(0);
    function alertPercentage() {
      percentage.value++;
    }
  
    return {
      percentage,
      alertPercentage
    }
  },
})



</script>

<template>
  <router-view></router-view>
</template>

<style scoped>


</style>
