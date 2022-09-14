<script>
    import Ocr from './Ocr.vue';
    export default {
        emits : ['documentLoaded'],
        data() {
            return {
                document: null,
                savedBlocks:null
            };
        },
        methods: {
            getDoc() {
                //fetche the document
                const formData = new FormData();
                formData.append("documentId", this.$route.params.documentId);
                fetch("http://localhost:8080/api/get-document", {
                    method: "POST",
                    body: formData,
                }).then(res => {
                    console.log('big todo')
                    const image = new Image();
                    const vm = this
                    image.onload = (e) => {
                        const canvas = document.querySelector("#canvas");
                        canvas.width = e.target.width;
                        canvas.height = e.target.height;
                        canvas.style.backgroundImage = `url(${image.src})`;
                        vm.getSavedBlocks()
                    }
                    image.src = '/triumph_1.png'
                // }).then(imageBlobResponse => {
                //     console.log(imageBlobResponse)
                //     const fileReader = new FileReader()
                //     const data = fileReader.readAsArrayBuffer(imageBlobResponse)
                //     .then(function(buffer){
                //         const blobImage = new Blob([buffer], {type: "image/png"});
                //         const imageObjectURL = URL.createObjectURL(blobImage);
                //         console.log(blobImage)
                //         const image = new Image();
                //         image.onload = () => {
                //             const divImage = this.document.querySelector("#document")
                //             divImage.appendChild(image)
                //         }
                //         image.src = imageObjectURL;
                //     })
                    
                })
            },
            getSavedBlocks() {
                const formData = new FormData();
                const header = new Headers();
                header.append('Accept', 'application/json')
                formData.append("documentId", this.$route.params.documentId);
                fetch("http://localhost:8080/api/get-blocks", {
                    method: "POST",
                    body: formData,
                    headers: header
                })
                .then( response => {
                    return response.json()
                })
                .then( resAsJson => {
                    this.savedBlocks = resAsJson
                })
            },
        },
        
        components: { Ocr }
    }
</script>
<template>
    
    <Ocr :savedBlocks="savedBlocks"/>
    <el-row class="previewed-image">
            <el-col :span="18">
                <canvas id="canvas"></canvas>
            </el-col>
        </el-row>
    <el-button @click="getDoc()">Get doc</el-button>
</template>