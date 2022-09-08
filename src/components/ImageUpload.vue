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
      canvasContext: null,
      ratio:1,
      rawDataFromOcr:null,
      files : [],
      canUpload:true,
      percentage:0,
      showPercentage:false,
      step:0,
      loading: false,
      selectedBlocks : {},
      colors : {
        1:'black',
        2:'blue',
        3:'green',
        'default': 'red' 
      }
    }
  },
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

        header.append('Accept', 'application/text')
        fetch('http://localhost:8080/api/file-upload', {
            method: 'POST',
            body: formData,
            headers: header,
        })
        .then(response => {
            return response.text()
        })
        .then(resAsText => {
            this.drawImage(resAsText)
            this.canUpload = false
            this.showPercentage = true;
            this.step=1
            this.loading=false;
        })
        
    },
    selectionDone() {
        //loop and change the draw type
        this.selectedBlocks[this.step].forEach(block => {
            this.drawingInfo.forEach((draw,index) => {
                if (block.top == draw.topForBlock &&
                    block.left == draw.leftForBlock &&
                    block.width == draw.widthForBlock &&
                    block.height == draw.heightForBlock) {
                        draw.drawType='final'
                    }
            })
            
        })
        
        this.percentage = Math.round(this.step/3*100)
        this.step++;
        
    },
    drawImage(data) {
        this.rawDataFromOcr = data.split('\n');
        let processingBlock = 0
        let topOffsetForBlock = 0 
        let leftOffsetorBlock = 0
        let widthForBlock = 0
        let heightForBlock = 0
        let drawBlockInfo = [];
        this.rawDataFromOcr.forEach((line, index) => {
            if (index != 0) {
                const arr = line.split("\t");
                const lineNumberForBlock = arr[2]
                if (lineNumberForBlock != processingBlock) {
                    //changing block
                    processingBlock = lineNumberForBlock
                    drawBlockInfo.push({
                        'topForBlock' : topOffsetForBlock,
                        'leftForBlock' : leftOffsetorBlock,
                        'widthForBlock' : widthForBlock,
                        'heightForBlock' : heightForBlock,
                        'drawType': 'stroke' 
                    })
                    widthForBlock = arr[8]
                    heightForBlock = arr[9]
                    topOffsetForBlock = parseInt(arr[7])
                    leftOffsetorBlock = parseInt(arr[6])
                        
                    
                } else {
                    if (arr[10] != '-1') {
                        
                        widthForBlock = Math.max(widthForBlock, arr[8])
                        heightForBlock = Math.max(heightForBlock, arr[9])
                    }
                    
                }

                    
            }
        })
        this.drawingInfo = drawBlockInfo
        drawBlockInfo.forEach(drawInfo=> {
            this.canvasContext.strokeStyle = this.colors.default
            this.canvasContext.strokeRect(parseInt(drawInfo.leftForBlock), 
                            parseInt(drawInfo.topForBlock),
                            parseInt(drawInfo.widthForBlock),
                            parseInt(drawInfo.heightForBlock))
        })
        const canvas = document.querySelector("#canvas")
        const vm = this;
        canvas.addEventListener('click', function(event) {
            const x = event.layerX
            const y = event.layerY
            drawBlockInfo.forEach((drawInfo,index)=> {
                if ((x >= drawInfo.leftForBlock && 
                    x<= drawInfo.leftForBlock + drawInfo.widthForBlock) &&
                    (y >= drawInfo.topForBlock &&
                    y<= drawInfo.topForBlock + drawInfo.heightForBlock)) {
                        if (drawInfo.drawType != 'final') {
                            vm.canvasContext.clearRect(drawInfo.leftForBlock,
                            drawInfo.topForBlock, 
                            drawInfo.widthForBlock,
                            drawInfo.heightForBlock);  
                        } 
                        if (drawInfo.drawType == 'stroke' && vm.step ==1) {
                            drawBlockInfo[index].drawType = 'fill'
                            vm.canvasContext.fillRect(drawInfo.leftForBlock,
                            drawInfo.topForBlock, 
                            drawInfo.widthForBlock,
                            drawInfo.heightForBlock);
                            if(!vm.selectedBlocks[vm.step]) {
                                vm.selectedBlocks[vm.step] = []
                            }
                            //check if the block is already there
                            const tempBlock = {
                                top:drawInfo.topForBlock,
                                left:drawInfo.leftForBlock,
                                width: drawInfo.widthForBlock,
                                height:drawInfo.heightForBlock
                            };
                            const tempArray = vm.selectedBlocks[vm.step]
                            let skip =false
                            tempArray.forEach((block, index) => {
                                if ((block.top!=tempBlock.top ||
                                    block.left!=tempBlock.left ||
                                    block.width!=tempBlock.width ||
                                    block.height!=tempBlock.height) && !skip) {
                                        vm.selectedBlocks[vm.step].push(tempBlock)
                                        skip=true
                                    }
                            })
                            if (vm.selectedBlocks[vm.step].length == 0) {
                                vm.selectedBlocks[vm.step].push(tempBlock)
                            }
                        } else if (drawInfo.drawType == 'fill' && vm.step==1) {
                            drawBlockInfo[index].drawType = 'stroke'
                            vm.canvasContext.strokeRect(drawInfo.leftForBlock,
                            drawInfo.topForBlock, 
                            drawInfo.widthForBlock,
                            drawInfo.heightForBlock);
                            //check if the block is already there
                            const tempBlock = {
                                top:drawInfo.topForBlock,
                                left:drawInfo.leftForBlock,
                                width: drawInfo.widthForBlock,
                                height:drawInfo.heightForBlock
                            };
                            const tempArray = vm.selectedBlocks[vm.step]

                            tempArray.forEach((block, index) => {
                                if (block.top==tempBlock.top &&
                                    block.left==tempBlock.left &&
                                    block.width==tempBlock.width &&
                                    block.height==tempBlock.height) {
                                        //element is present, remove
                                        vm.selectedBlocks[vm.step].splice(index, 1)
                                    }
                            })
                    } else {
                        const tempBlock = {
                            top:drawInfo.topForBlock,
                            left:drawInfo.leftForBlock,
                            width: drawInfo.widthForBlock,
                            height:drawInfo.heightForBlock
                        };
                        if(!vm.selectedBlocks[vm.step]) {
                                vm.selectedBlocks[vm.step] = [];
                        }
                        const tempArray = vm.selectedBlocks[vm.step];
                        tempArray.forEach(block => {
                            if (block.top == tempBlock.top &&
                                block.left == tempBlock.left &&
                                block.width == tempBlock.width &&
                                block.height == tempBlock.height) {
                                    console.log('removing')
                                    vm.canvasContext.clearRect(tempBlock.left,
                                        tempBlock.top, 
                                        tempBlock.width,
                                        tempBlock.height);  
                                    vm.canvasContext.strokeStyle = vm.colors.default
                                    vm.canvasContext.strokeRect(drawInfo.leftForBlock,
                                        drawInfo.topForBlock, 
                                        drawInfo.widthForBlock,
                                        drawInfo.heightForBlock);  
                                } else {
                                    vm.selectedBlocks[vm.step].push(tempBlock)
                                    vm.canvasContext.strokeStyle = vm.colors[vm.step]
                                    vm.canvasContext.strokeRect(tempBlock.left,
                                    tempBlock.top, 
                                    tempBlock.width,
                                    tempBlock.height);
                                }
                        })
                        
                        if (vm.selectedBlocks[vm.step].length == 0) {
                            vm.selectedBlocks[vm.step].push(tempBlock)
                            vm.canvasContext.strokeStyle = vm.colors[vm.step]
                            vm.canvasContext.strokeRect(drawInfo.leftForBlock,
                            drawInfo.topForBlock, 
                            drawInfo.widthForBlock,
                            drawInfo.heightForBlock);
                        }
                    }
                }
            })
        })                
    }
  }
}
</script>

<template>
        <el-progress :percentage=percentage v-if="showPercentage"/>
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
            <el-col :span="6">
                <Tutorial @selectionDone="selectionDone" :step=step v-if="step!=0"/>
            </el-col>
        </el-row>
</template>

<style scoped>
</style>