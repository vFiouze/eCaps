<script>
import { forEach } from 'lodash'

    export default {
        props : ['rawData','data','step', 'savedBlocks'],
        data(){
            return {
                documentId: null,
                selectedBlocks : {},
                colors : {
                    1:'black',
                    2:'blue',
                    3:'green',
                    'default': 'red' 
                },
                canvasContext: null,
                drawingInfo : [],
            }
        },
        emit : ['saveInfo'],
        watch: {
            savedBlocks: function (newVal, oldVal) {
                console.log('in ocr after getting blocks')
                console.log(newVal)
                this.canvasContext = this.getCanvasContext()
                Object.keys(newVal.selectedBlocks).forEach(key => {
                    let type = key == 1 ? 'fill' : 'stroke'
                    let step = parseInt(key)
                    let color = this.colors[step]
                    this.drawAllBlocks(Object.values(newVal.selectedBlocks[key]), type, color );
                }
            )},
            rawData: function(newVal, oldVal) {
                const canvas = document.querySelector("#canvas");
                const ctx = canvas.getContext('2d');
                this.canvasContext = ctx
                this.documentId = newVal.documentId
                this.identifyBlocks(newVal.ocr);
                this.drawAllBlocks(this.drawingInfo, 'stroke', this.colors.default);
                this.handleEventListener();
                // this.drawImage(newVal)
            },
            step: function(newVal, oldVal) {
                if (newVal != 1  && newVal < 4) {
                    this.lockBlock(oldVal)
                }
                if (oldVal == 4) {
                    //remove event listener
                    document.querySelector('#canvas')
                        .removeEventListener('click', this.handleClick)
                    this.$emit('saveInfo', this.selectedBlocks, this.documentId)
                        
                    
                }
            }
        },
        methods: {
            documentLoaded(data) {
                console.log('data')
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
                this.documentId = data.documentId
                
                
                
            },
            isInblock(e, block) {
                const x = e.layerX
                const y = e.layerY
                if ((x >= block.leftForBlock && 
                        x<= block.leftForBlock + block.widthForBlock) &&
                        (y >= block.topForBlock &&
                        y<= block.topForBlock + block.heightForBlock)) {
                            return true
                }
                
            },

            handleClick(event) {  
                this.drawingInfo.forEach((drawInfo,index)=> {
                    if (this.isInblock(event, drawInfo)) {
                        //clear block if it's not final
                        if (drawInfo.drawType != 'final') {
                            this.clearBlock(drawInfo)
                            if (drawInfo.drawType == 'stroke') {
                                this.changeDrawType(index)
                                if (this.step == 1) {
                                    //hide personal info
                                    this.drawFill(drawInfo)
                                } else {
                                    //stroke with color
                                    this.drawStroke(drawInfo)
                                }                                
                                this.addToSelectedBlocks(drawInfo)
                            } else if (drawInfo.drawType == 'fill') {
                                this.changeDrawType(index)
                                this.drawStroke(drawInfo)
                                this.removeFromSelectedBlocks(drawInfo)
                                
                            }
                        }
                    }
                })
            }, 
            handleEventListener() {
                const vm = this
                document.querySelector('#canvas').addEventListener('click', this.handleClick)                
            },

            drawStroke(blockInfo) {
                const ctx = this.getCanvasContext()
                ctx.strokeStyle = this.colors[this.step];
                ctx.strokeRect(blockInfo.leftForBlock,
                    blockInfo.topForBlock, 
                    blockInfo.widthForBlock,
                    blockInfo.heightForBlock);
            },

            drawFill(blockInfo) {
                const ctx = this.getCanvasContext()
                ctx.fillRect(blockInfo.leftForBlock,
                blockInfo.topForBlock, 
                blockInfo.widthForBlock,
                blockInfo.heightForBlock);
            },

            identifyBlocks(data) {
                const rawDataFromOcr = data.split('\n');
                let processingBlock = 0
                let topOffsetForBlock = 0 
                let leftOffsetorBlock = 0
                let widthForBlock = 0
                let heightForBlock = 0
                let drawBlockInfo = [];
                rawDataFromOcr.forEach((line, index) => {
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
            },

            drawAllBlocks(drawBlockInfo, type, color) {
                drawBlockInfo.forEach(drawInfo=> {
                    this.canvasContext.strokeStyle = color
                    if (type=='stroke') {
                        this.canvasContext.strokeRect(parseInt(drawInfo.leftForBlock), 
                                    parseInt(drawInfo.topForBlock),
                                    parseInt(drawInfo.widthForBlock),
                                    parseInt(drawInfo.heightForBlock))
                    } else {
                        this.canvasContext.fillRect(parseInt(drawInfo.leftForBlock), 
                                    parseInt(drawInfo.topForBlock),
                                    parseInt(drawInfo.widthForBlock),
                                    parseInt(drawInfo.heightForBlock))
                    }  
                })
            },
            clearBlock(block){
                const ctx = this.getCanvasContext()
                ctx.clearRect(block.leftForBlock,
                                block.topForBlock, 
                                block.widthForBlock,
                                block.heightForBlock);
            },

            getCanvasContext() {
                const canvas = document.querySelector('#canvas')
                return canvas.getContext('2d')
            },

            addToSelectedBlocks(block) {
                if(!this.selectedBlocks[this.step]) {
                    this.selectedBlocks[this.step] = []
                }
                
                const vm = this
                let addBlock = true
                this.selectedBlocks[this.step].forEach((alreadySelectedBlock, index) => {
                    if ((alreadySelectedBlock.topForBlock == block.topForBlock &&
                    alreadySelectedBlock.leftForBlock == block.leftForBlock &&
                    alreadySelectedBlock.widthForBlock == block.widthForBlock &&
                    alreadySelectedBlock.heightForBlock == block.heightForBlock)) {
                        addBlock = false
                    }
                })
                if (addBlock || this.selectedBlocks[this.step].length == 0) {
                    this.selectedBlocks[this.step].push(block)
                }
            },

            removeFromSelectedBlocks(block) {
                const tempArray = this.selectedBlocks[this.step]
                const vm = this
                tempArray.forEach((alreadySelectedBlock, index) => {
                    if (alreadySelectedBlock.top==block.top &&
                        alreadySelectedBlock.left==block.left &&
                        alreadySelectedBlock.width==block.width &&
                        alreadySelectedBlock.height==block.height) {
                            //element is present, remove
                            this.selectedBlocks[this.step].splice(index, 1)
                        }
                })
            },
            changeDrawType(blockIndex) {
                this.drawingInfo[blockIndex].drawType = 
                    this.drawingInfo[blockIndex].drawType == 'fill' ?
                    'stroke' : 'fill'

            },
            lockBlock(step) {
                this.selectedBlocks[step].forEach(selectedBlocksForStep => {
                    selectedBlocksForStep['drawType'] = 'final'
                })
            }
        }
    }
</script>

<template>    

</template>

<style scoped>

</style>