<script>
import { forEach } from 'lodash';
import Tutorial from './Tutorial.vue';
export default {
  components: {
    Tutorial,
  },
  data() {
    return {
      showImage: false,
      image: null,
      drawingInfo : null,
      ratio:1,
      rawDataFromOcr:null,
      files : [],
      canUpload:true,
      percentage:0,
      showPercentage:false,
      step:0,
      loading: false,
    }
  },
  emits: [
        'uploadDone',
    ],
  methods: {
    handleUploadImage(f) {
        this.loading= true
        const vm = this;
        if (f) {
            this.files.push(f)
            vm.showImage=true;
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const image = new Image();
                vm.image = image;
                image.onload = (e) => { 
                    //create canavas
                    const canvas = document.querySelector("#canvas");
                    const ctx = canvas.getContext('2d');
                    vm.canvasContext = ctx
                    canvas.width = e.target.width * vm.ratio;
                    canvas.height = e.target.height * vm.ratio;                    
                    canvas.style.backgroundImage = `url(${vm.image.src})`;
                    vm.sendImage()
                }
                image.src = URL.createObjectURL(vm.files[0].raw);
            };
            fileReader.readAsDataURL(this.files[0].raw);
        }
    },
    sendImage() {
        this.loading=true;
        const formData = new FormData();
        formData.append("image", this.files[0].raw);
        const header = new Headers();
        header.append('Accept', 'application/json')
        fetch('http://localhost:8080/api/file-upload', {
            method: 'POST',
            body: formData,
            headers: header,
        })
        .then(response => {
            return response.json()
        })
        .then(resAsJson => {
            this.$emit('uploadDone', resAsJson)
            this.canUpload = false
            this.showPercentage = true;
            this.loading=false;
        })
        
    },
  }
}
</script>

<template>
        <el-row v-loading="loading" v-if="canUpload">
            <el-upload 
                :auto-upload=false 
                :on-change="handleUploadImage">
                <template #trigger>
                    <el-button type="primary">select file</el-button>
                    </template>
                
            </el-upload>
        </el-row>
        <el-row class="previewed-image">
            <el-col :span="18">
                <canvas id="canvas"></canvas>
            </el-col>
        </el-row>
</template>

<style scoped>
</style>