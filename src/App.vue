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
  <Main ></Main>
</template>

<style scoped>


</style>
