<script>
    import Header from './Header.vue';
    import ImageUpload from './ImageUpload.vue';
    import Ocr from './Ocr.vue';
    export default {
        components : {
            Header,
            ImageUpload,
            Ocr
        },
    }
</script>

<template>
  <Ocr/>
    <el-container>
      <el-header>
        <Header/>
      </el-header>
      <el-main>
        <ImageUpload/>
      </el-main>
    </el-container>

  <main>
  </main>
</template>

<style scoped>

</style>